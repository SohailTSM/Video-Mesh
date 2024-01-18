import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

const HomePage = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = useCallback(async () => {
    if (usernameInput.length < 3) {
      return alert('Username must be atleast 3 characters long');
    }
    const roomId = uuid();

    navigate('/' + roomId + '?flag=C&username=' + usernameInput);
  }, [usernameInput]);

  const handleJoinRoom = useCallback(async () => {
    if (usernameInput.length < 3) {
      return alert('Username must be atleast 3 characters long adfasdf');
    }
    const res = await fetch('http://localhost:3000/checkRoom/' + roomIdInput);
    const data = await res.json();
    if (!data.isRoom) {
      return alert('Enter a valid room Id');
    }
    navigate('/' + roomIdInput + '?flag=J&username=' + usernameInput);
  }, [usernameInput, roomIdInput]);

  return (
    <div className='mt-20'>
      <form className='max-w-sm mx-auto'>
        <div className='mb-5'>
          <label
            htmlFor='username'
            className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
          >
            Username
          </label>
          <input
            type='text'
            id='username'
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            required=''
            onChange={(e) => setUsernameInput(e.target.value)}
            value={usernameInput}
          />
        </div>

        <button
          type='button'
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 '
          onClick={handleCreateRoom}
        >
          Create Room
        </button>

        <div className='my-5'>
          <label
            htmlFor='room-id'
            className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
          >
            Room Id
          </label>
          <input
            type='text'
            id='room-id'
            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            required=''
            onChange={(e) => setRoomIdInput(e.target.value)}
            value={roomIdInput}
          />
        </div>
        <button
          type='button'
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
          onClick={handleJoinRoom}
        >
          Join Room
        </button>
      </form>
    </div>
  );
};
export default HomePage;
