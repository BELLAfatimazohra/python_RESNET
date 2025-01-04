import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.scss';
import Navbar from './Navbar';

const Home = () => {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const paragraphRef = useRef(null);

  const [titleVisible, setTitleVisible] = useState(false); 
  const [paragraphVisible, setParagraphVisible] = useState(false); 

  const goToUploadPage = () => {
    navigate('/upload');
  };

  const typeWriter = (element, text, delay, onFinish) => {
    let index = 0;

    const interval = setInterval(() => {
      if (element.current) { 
        if (index < text.length) {
          element.current.innerHTML += text.charAt(index);
          index++;
        } else {
          clearInterval(interval); 
          onFinish(); 
        }
      } else {
        clearInterval(interval);
      }
    }, delay);
  };

  useEffect(() => {
    const titleTimeout = setTimeout(() => {
      setTitleVisible(true); 
      if (titleRef.current) {
        typeWriter(titleRef, "Bienvenue sur l'application de reconnaissance d'image !", 50, () => {
          setParagraphVisible(true); 
        });
      }
    }, 100);

    const paragraphTimeout = setTimeout(() => {
      if (paragraphRef.current && titleVisible) {
        typeWriter(paragraphRef, "Appuyez sur le bouton pour commencer.", 50, () => {});
      }
    }, 4000);

    return () => {
      clearTimeout(titleTimeout);
      clearTimeout(paragraphTimeout); 
    };
  }, [titleVisible]);

  return (
    <div className="home-container">
      <Navbar />
      {titleVisible && <h1 ref={titleRef}></h1>} {}
      {paragraphVisible && <p ref={paragraphRef}></p>} {}
      <button onClick={goToUploadPage}>Commencer</button>
      {}
      <img className="bottom-right-image" src="/images/ec.png" alt="Illustration" />
    </div>
  );
};

export default Home;
