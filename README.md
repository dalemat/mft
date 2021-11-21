# Project deliverables:
1. Create a BNB staking contract the same behavior as bnbfactor
2. On top of the bnbfactor contract, I will add the following new logics
    - When users stake BNB, they will get 0.001 custom BEP20 token as reward directly to their wallet.
    - A onlyOwner function to let contract owner input custom BEP20 reward token
    - A onlyOwner function to let contract owner withdraw custom BEP20 reward token.
    - Once the custom BEP20 reward token becomes 0, it will no longer reward 0.001 BEP20 custom token when users stake BNB
3. The frontend style will be based on bnbfactor
    - History section in Dashboard will be removed.
    - Home page information url will be provided by customer

# Usage
1. preriquisition:
    - nodejs 
2. Dependencies installation
```
npm install
```
3. set the enviornment variable
    - Modify the content of env file
    - change the file name to .env

4. export .out file (to deploy on share hosting)
```
run npm export
```

5. run devleopment server on localhost:3000
```
npm run dev
```
