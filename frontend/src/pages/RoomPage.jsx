import { useLoaderData } from 'react-router-dom';
import { connectToSocket } from '../socket';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { usePeers } from '../providers/PeersProvider';

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const roomId = url.pathname.split('/')[1];
  const flag = url.searchParams.get('flag');
  const username = url.searchParams.get('username');
  const socket = connectToSocket(username);
  return { flag, username, socket, roomId };
};

let keyCount = 0;

const RoomPage = () => {
  const { flag, username: myUsername, socket, roomId } = useLoaderData();
  const { peerConnections, createOffer, createAnswer, saveAnswer } = usePeers();
  const [videoStreams, setVideoStreams] = useState({});

  const handleNewUser = useCallback(async ({ username }) => {
    const offer = await createOffer(username);
    socket.emit('offer-to', { offer, to: username, from: myUsername });
  }, []);

  const handleOffer = useCallback(async ({ offer, username }) => {
    console.log(offer);
    const answer = await createAnswer({ offer, username });
    socket.emit('answer-to', { answer, to: username, from: myUsername });
  }, []);

  const handleAnswer = useCallback(async ({ answer, username }) => {
    console.log(answer);
    await saveAnswer({ answer, username });
  }, []);

  const handleIceCandidate = useCallback(async ({ iceCandidate, username }) => {
    try {
      await peerConnections[username].addIceCandidate(iceCandidate);
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  }, []);

  useEffect(() => {
    if (flag == 'C') {
      socket.emit('create-room', { roomId });
    } else if (flag == 'J') {
      socket.emit('join-room', { roomId });
    }

    let localStream = '';
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setVideoStreams((prev) => {
          return { ...prev, [myUsername]: stream };
        });
      });

    socket.on('new-user', handleNewUser);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('new-user', handleNewUser);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, []);

  return (
    <div>
      {videoStreams[myUsername]
        ? Object.keys(videoStreams).map((key) => (
            <video
              id='local-video'
              autoPlay
              playsInline
              controls={false}
              ref={(ref) => {
                if (ref) ref.srcObject = videoStreams[key];
              }}
              key={keyCount++}
            />
          ))
        : null}
    </div>
  );
};
export default RoomPage;
