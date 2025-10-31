import dns from "dns/promises";

/**
 * Checks whether the server has an active Internet connection.
 * @returns {Promise<boolean>}
 */
export const checkInternetConnection = async () => {
    try {
        await dns.lookup("google.com"); // lightweight DNS check
        return true;
    } catch {
        return false;
    }
};
