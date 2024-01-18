import { createContext, useContext, useCallback } from 'react';

const PeersContext = createContext();

const peerConnections = {};

const configuration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export const usePeers = () => useContext(PeersContext);

const PeersProvider = ({ children }) => {
  const addIceCandidateEvent = async (peerConnection) => {
    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          iceCandidate: event.candidate,
        });
      }
    });
  };

  const createOffer = useCallback(async (username) => {
    peerConnections[username] = new RTCPeerConnection(configuration);
    await addIceCandidateEvent(peerConnections[username]);
    const offer = await peerConnections[username].createOffer();
    await peerConnections[username].setLocalDescription(offer);
    return offer;
  }, []);

  const createAnswer = useCallback(async ({ offer, username }) => {
    peerConnections[username] = new RTCPeerConnection(configuration);
    await peerConnections[username].setRemoteDescription(offer);
    const answer = await peerConnections[username].createAnswer();
    await peerConnections[username].setLocalDescription(answer);
    return answer;
  }, []);

  const saveAnswer = useCallback(async ({ answer, username }) => {
    await peerConnections[username].setRemoteDescription(answer);
  }, []);

  return (
    <PeersContext.Provider
      value={{ peerConnections, createOffer, createAnswer, saveAnswer }}
    >
      {children}
    </PeersContext.Provider>
  );
};
export default PeersProvider;
