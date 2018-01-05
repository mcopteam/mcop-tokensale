#########################################################################
# File Name: flattener.sh
# Author: ma6174
# mail: ma6174@163.com
# Created Time: 六 12/30 00:54:25 2017
#########################################################################
#!/bin/bash

cd flatten_contracts 
rm -rf *
cd ..
truffle-flattener contracts/MCOPCrowdSale.sol >flatten_contracts/MCOPCrowdSaleFlat.sol
