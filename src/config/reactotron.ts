import Reactotron from 'reactotron-react-native';

const reactotron = Reactotron.configure({name: '맛잇다', host: '192.168.45.187'}).useReactNative().connect();

export default reactotron;
