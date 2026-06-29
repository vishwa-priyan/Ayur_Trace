  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAtk891M33a3Ej4wNwmB0jq5jXnTUA2B5c",
    authDomain: "ayurtrace-87407.firebaseapp.com",
    projectId: "ayurtrace-87407",
    storageBucket: "ayurtrace-87407.firebasestorage.app",
    messagingSenderId: "455309598311",
    appId: "1:455309598311:web:e30b868b6a11616e4abec2",
    measurementId: "G-27Y1WGN9Q7"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };