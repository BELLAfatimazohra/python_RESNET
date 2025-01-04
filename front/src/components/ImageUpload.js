import React, { useState, useRef } from 'react';
import './ImageUpload.scss';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [similarImages, setSimilarImages] = useState([]);
  const [predictedClass, setPredictedClass] = useState(null); // Nouveau état pour stocker la classe prédite
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    } catch (err) {
      console.error("L'accès à la caméra a échoué", err);
      alert("Impossible d'accéder à la caméra. Veuillez vérifier vos paramètres.");
    }
  };

  const handleTakePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/png');
    setSelectedImage(imageDataUrl);
    handleStopStream();
  };

  const handleStopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      videoRef.current.srcObject = null;
    }
  };

  const handleShowSimilarImages = async () => {
    if (selectedImage) {
      const formData = new FormData();
      const blob = await fetch(selectedImage).then(res => res.blob());
      formData.append('file', blob, 'image.png');

      try {
        const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        // Affichage du nom de la classe prédite
        const predictedClass = data.predicted_class;
        setPredictedClass(predictedClass); // Mise à jour de l'état avec le nom de la classe prédite

        // Générer le chemin pour les images similaires
        const imageFolder = `/dataset/${predictedClass}`;

        // Tableau pour les images similaires
        const similarImagesArray = [];

        for (let i = 1; i <= 6; i++) {
          // Ajout des fichiers .jpg et .webp
          similarImagesArray.push(`${imageFolder}/${predictedClass}${i}.jpg`);

        }


        setSimilarImages(similarImagesArray);

      } catch (error) {
        console.error("Erreur lors de l'envoi de l'image :", error);
      }
    }
  };

  return (
    <div className="image-upload-container">
      <h2>Sélectionnez ou capturez une image</h2>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      <button onClick={handleCapture}>Allumer la caméra</button>
      <video ref={videoRef} style={{ display: stream ? 'block' : 'none', margin: '20px auto', width: '640px', height: '480px' }}></video>
      <button onClick={handleTakePhoto} disabled={!stream}>Capturer l'image</button>
      <button onClick={handleStopStream} disabled={!stream}>Arrêter la caméra</button>

      {selectedImage && (
        <div style={{ marginTop: '20px' }}>
          <h3>Image sélectionnée :</h3>
          <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', height: 'auto' }} />
          <button onClick={handleShowSimilarImages} style={{ marginTop: '20px' }}>Les images similaires</button>
        </div>
      )}



      {/* Affichage des images similaires */}
      {similarImages.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Images similaires :</h3>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {similarImages.map((image, index) => (
              <img
                key={index}
                src={`http://localhost:3000/${image}`} // Assurez-vous que le serveur React peut servir ces images
                alt={`Similar ${index}`}
                style={{ width: '150px', height: 'auto', margin: '10px' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
