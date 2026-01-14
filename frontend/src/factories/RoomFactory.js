export default class RoomFactory {
  static create(userId, restaurants) {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    return {
      id: roomId,
      users: [userId],
      restaurants: restaurants,
      swipes: { [userId]: {} },
      matches: [],
      created: new Date().toISOString(),
      status: 'active'
    };
  }
}