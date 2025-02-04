import axios from 'axios';

const getEthPrice = async () => {
    try {
        const response = await axios.post('https://mainnet.era.zksync.io/', {
            id: 42,
            jsonrpc: '2.0',
            method: 'zks_getTokenPrice',
            params: ['0x0000000000000000000000000000000000000000'],
        });
        return response.data.result
    } catch (e) {
        console.log(e)
        return 1900
    }

}

async function getStarkAmount(address) {
    try {
        const ethPrice = await getEthPrice();
        let url = `https://voyager.online/api/contract/${address}/transfers?ps=50&p=1`;
        const response = await axios.get(url);
        const lastPage = response.data.lastPage;
        let totalExchangeAmount = 0;
        for (let i = 1; i <= lastPage; i++) {
            const url = `https://voyager.online/api/contract/${address}/transfers?ps=50&p=${i}`;
            const response = await axios.get(url);
            const list = response.data.items;
            for (let i = 0; i < list.length; i++) {
                if (list[i]['transfer_from']?.toLowerCase() === address?.toLowerCase() && list[i]['transfer_to']?.toLowerCase() !== '0x01176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8') {
                    const symbol = list[i]['token_symbol'];
                    if (symbol === 'ETH') {
                        totalExchangeAmount += (parseFloat(list[i]['transfer_value']) * parseFloat(ethPrice))
                    }
                    else if (symbol === 'USDC') {
                        totalExchangeAmount += parseFloat(list[i]['transfer_value'])
                    }
                }
            }
        }
        return {stark_exchange_amount: totalExchangeAmount.toFixed(2)};
    } catch (error) {
        console.error(error);
        return {stark_exchange_amount: "Error"};
    }
}
export default getStarkAmount;