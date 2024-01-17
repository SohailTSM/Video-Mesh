import { connectToSocket } from '../socket';

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const roomId = url.pathname.split('/')[1];
  const flag = url.searchParams.get('flag');
  const username = url.searchParams.get('username');
  const socket = connectToSocket(username);
  return { flag, username, socket };
};

const RoomPage = () => {
  return <div>
    
  </div>;
};
export default RoomPage;
