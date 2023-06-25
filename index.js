import { ethers } from "./ethers.min.js"
import { fundMeAbi, fundMeAddress } from "./constants.js"

const connectBtn = document.getElementById("connectBtn")
const fundBtn = document.getElementById("fundBtn")
const showFundMeBalanceBtn = document.getElementById("showFundMeBalanceBtn")
const showFundMeBalanceSpan = document.getElementById("showFundMeBalanceSpan")
const ethAmountInput = document.getElementById("ethAmountInput")
const withdrawBtn = document.getElementById("withdrawBtn")
connectBtn.onclick = connect
fundBtn.onclick = fund
showFundMeBalanceBtn.onclick = showFundMeBalance
withdrawBtn.onclick = withdraw

async function connect() {
    if (window.ethereum == null) {
        connectBtn.innerHTML = " Please install metamask "
        return false
    }
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectBtn.innerHTML = " connected "
}

async function fund() {
    const ethAmount = ethAmountInput.value ? ethAmountInput.value : "0.1"
    console.log(`Funding with ${ethAmount}`)
    if (window.ethereum == null) {
        console.log("MetaMask not installed;")
        return false
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(fundMeAddress, fundMeAbi, signer)

    try {
        const tx = await contract.fund({
            value: ethers.parseEther(ethAmount),
        })
        await tx.wait(1)
        await listenForTransactionMine(tx, provider)
        console.log("Done!")
    } catch (error) {
        console.log(error)
    }
}

async function withdraw() {
    if (window.ethereum == null) {
        console.log("MetaMask not installed;")
        return false
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(fundMeAddress, fundMeAbi, signer)

    try {
        const tx = await contract.withdraw()
        await tx.wait(1)
        await listenForTransactionMine(tx, provider)
        console.log("withdraw is done!")
    } catch (error) {
        console.log(error)
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Minning ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, async (transactionReceipt) => {
            const confirmations = await transactionReceipt.confirmations()
            console.log(`Completed with ${confirmations} confirmation`)
            resolve()
        })
    })
}

async function showFundMeBalance() {
    if (window.ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults")
        return false
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const balance = await provider.getBalance(fundMeAddress)
    showFundMeBalanceSpan.innerHTML = ethers.formatEther(balance)
}
