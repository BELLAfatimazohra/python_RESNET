from flask import Flask, request, jsonify
import os
from glob import glob
import cv2
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet_v2 import ResNet50V2, preprocess_input
from tensorflow.keras.applications import imagenet_utils
from flask_cors import CORS
import logging

# configuration dyal logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

# charger le modèle ResNet50V2 pré-entraîné
resnet50v2 = ResNet50V2(weights='imagenet')

class_name_mapping = {
    'n04548362': 'wallet',
    'n04557648': 'water_bottle',
    'n03938244' :'pillow',
    'n04522168':'vase',
    'n03908618':'pencil_box',
    'n07873807': 'pizza',
    'n07753592': 'banana',
    'n02504458': 'African_elephant',
    'n03291819': 'table',
    'n02979186': 'reflex_camera',
    'n03793489':'mouse',
    'n03196217':'digital_clock',
    'n04548280':'wall_clock',
    'n03197337':'digital_watch',
    'n04356056':'sunglasses',
    'n03085013':'computer_keyboard',
    'n03180011':'desktop_computer',
    'n04355933':'sunglass',
    'n02948072':'candle',
    'n03594734':'jean',
    'n02999410':'chain',
    'n04120489':'running_shoe',
    'n04370456':'sweatshirt',
    'n03617480':'kimono',
    'n03916031':'perfume',
    'n04069434':'reflex_camera',
    'n03976467':'Polaroid_camera',
    'n04350905':'suit',
    'n04133789':'clog',
    'n03595614':'jersey',
    'n04264628':'space_bar'
}

# definition de fonction de prediction
def predict_image_class(img_path):
    logging.info(f"Traitement de l'image : {img_path}")
    img = cv2.imread(img_path)
    if img is None:
        logging.error(f"Impossible de charger l'image à l'emplacement : {img_path}")
        raise ValueError("Erreur lors du chargement de l'image.")
    
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    resized_img = np.expand_dims(img, axis=0)
    final_image = preprocess_input(resized_img)

    # utilisation de fnction predict de modele resnet
    predictions = resnet50v2.predict(final_image)
    results = imagenet_utils.decode_predictions(predictions)

    predicted_class, _, _ = results[0][0]
    logging.info(f"Classe prédite : {predicted_class}")
    
    predicted_class_folder = 'dataset/' + class_name_mapping.get(predicted_class, '').lower()
    
    
    
    return predicted_class_folder 

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        logging.error("Aucun fichier envoyé.")
        return jsonify({"error": "Aucun fichier envoyé."}), 400

    file = request.files['file']
    if file.filename == '':
        logging.error("Aucun fichier sélectionné.")
        return jsonify({"error": "Aucun fichier sélectionné."}), 400

    if not file.content_type.startswith('image/'):
        logging.error(f"Le fichier envoyé n'est pas une image : {file.filename}")
        return jsonify({"error": "Le fichier envoyé n'est pas une image."}), 400

    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in ALLOWED_EXTENSIONS:
        logging.error(f"Format de fichier non supporté : {file.filename}")
        return jsonify({"error": "Format de fichier non supporté. Formats acceptés : PNG, JPG, JPEG, WEBP"}), 400

    # sauvegarde l'image reçue
    img_path = os.path.join('uploads', file.filename)
    try:
        file.save(img_path)
        logging.info(f"Image sauvegardée à l'emplacement : {img_path}")
    except Exception as e:
        logging.error(f"Erreur lors de la sauvegarde du fichier : {str(e)}")
        return jsonify({"error": f"Erreur lors de la sauvegarde du fichier : {str(e)}"}), 500

    try:
        predicted_class_folder = predict_image_class(img_path)
        # retourne uniquement le nom de la classe
        predicted_class_name = os.path.basename(predicted_class_folder)
    except Exception as e:
        logging.error(f"Erreur lors de la prédiction : {str(e)}")
        return jsonify({"error": f"Erreur lors de la prédiction : {str(e)}"}), 
    logging.info(f"Prédiction réussie, classe : {predicted_class_name}")

    return jsonify({
        "message": "Prédiction réussie.",
        "predicted_class": predicted_class_name
    })

if __name__ == '__main__':
    logging.info("Démarrage du serveur Flask...")
    app.run(debug=True, port=5000)
