export const generateOTP = async () => {
    return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000)
}