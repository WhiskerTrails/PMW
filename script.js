// Initialize Firebase (compat style)
const firebaseConfig = {
  apiKey: "AIzaSyAavzVbEsqmJqaCKeaZuIO5p8ioz6-1wZ4",
  authDomain: "pet-memorial-website.firebaseapp.com",
  projectId: "pet-memorial-website",
  storageBucket: "pet-memorial-website.appspot.com",
  messagingSenderId: "722659287527",
  appId: "1:722659287527:web:950f5359e30b39fdb91d42"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#petForm");
  const fileInput = document.querySelector("#petPhoto");
  const preview = document.querySelector("#photoPreview");
  const message = document.querySelector("#submissionMessage");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = "none";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const petName = form.petName.value.trim();
    const ownerEmail = form.ownerEmail.value.trim();
    const messageText = form.message.value.trim();
    const file = fileInput.files[0];

    if (!petName || !ownerEmail || !messageText || !file) {
      message.textContent = "Please fill out all fields and upload a photo.";
      message.style.color = "red";
      return;
    }

    try {
      message.textContent = "Uploading photo...";
      message.style.color = "black";

      // Upload image to Firebase Storage
      const storageRef = storage.ref();
      const photoRef = storageRef.child('petPhotos/' + Date.now() + '_' + file.name);
      await photoRef.put(file);
      const photoURL = await photoRef.getDownloadURL();

      // Save form data to Firestore with approved=false
      await db.collection('petSubmissions').add({
        petName,
        ownerEmail,
        message: messageText,
        photoURL,
        approved: false,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      message.textContent = "Thank you! Your pet has been submitted and is awaiting approval.";
      message.style.color = "green";

      form.reset();
      preview.style.display = "none";
    } catch (error) {
      message.textContent = "Error uploading submission: " + error.message;
      message.style.color = "red";
    }
  });
});
const photos = document.querySelectorAll('.gallery-photo');
let currentIndex = 0;

function showNextPhoto() {
  photos[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % photos.length;
  photos[currentIndex].classList.add('active');
}

setInterval(showNextPhoto, 5000); // change photo every 5 seconds
