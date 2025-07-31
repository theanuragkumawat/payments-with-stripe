import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    this.databases = new Databases(client);
  }

  /**
   * @param {string} databaseId
   * @param {string} collectionId
   * @param {string} userId
   * @param {string} orderId
   * @returns {Promise<void>}
   */
  async createOrder(databaseId, collectionId, { userId, cartItems, addressInfo, orderStatus, paymentMethod,
    paymentStatus, totalAmount, orderDate, orderUpdateDate, paymentId, payerId, cartId }) {
    await this.databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        databaseId:databaseId, collectionId:collectionId, userId,cartItems:JSON.stringify(cartItems), addressInfo, orderStatus, paymentMethod,
        paymentStatus, totalAmount:JSON.stringify(totalAmount), orderDate, orderUpdateDate, paymentId, payerId, cartId
      }
    );
  }

  /**
   * @param {string} databaseId
   * @returns {Promise<boolean>}
   */
  async doesOrdersDatabaseExist(databaseId) {
    try {
      await this.databases.get(databaseId);
      return true;
    } catch (err) {
      if (err.code !== 404) throw err;
      return false;
    }
  }

  /**
   * @param {string} databaseId
   * @param {string} collectionId
   * @returns {Promise<boolean>}
   */
  async setupOrdersDatabase(databaseId, collectionId) {
    try {
      await this.databases.create(databaseId, 'Orders Database');
    } catch (err) {
      // If resource already exists, we can ignore the error
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createCollection(
        databaseId,
        collectionId,
        'Orders Collection',
        undefined,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'userId',
        255,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    try {
      await this.databases.createStringAttribute(
        databaseId,
        collectionId,
        'orderId',
        255,
        true
      );
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }
}

export default AppwriteService;
