# Baldmann Brain Region Mapper

This project maps action verbs to brain regions using semantic similarity and a precomputed dataset. It uses AI-powered language models to find the closest matching verb and outputs the associated brain regions.

---

## **Setup Instructions**

### 1. **Clone or Copy the Project**

Copy all project files and folders (including `data/`, `models/`, `utils/`, and all `.py` scripts) to your new device.

---

### 2. **Install Python and Dependencies**

- Install [Python 3.8+](https://www.python.org/downloads/) if not already installed.
- Open a terminal (Command Prompt or PowerShell) in your project folder.
- Install required packages:
    ```sh
    pip install -r requirements.txt
    ```

---

### 3. **Download Required Model and NLTK Data (First-Time Setup, Needs Internet)**

**a. Download Hugging Face Model**

- Run the following command to download and cache the SentenceTransformer model:
    ```sh
    python prepare_embeddings.py
    ```
  This will download the `all-MiniLM-L6-v2` model and create `models/dataset_embeddings.npy`.

**b. Download NLTK Data**

- The first time you run the app, it will try to download NLTK data (`wordnet`, `omw-1.4`).  
  If you want to do this manually, run:
    ```python
    import nltk
    nltk.download('wordnet')
    nltk.download('omw-1.4')
    ```

---

### 4. **(Optional) Prepare for Offline Use**

- After the above steps, all required models and data are cached locally.
- To ensure offline operation, set the environment variable before running:
    ```sh
    set HF_HUB_OFFLINE=1
    ```
  Or add these lines at the top of your scripts:
    ```python
    import os
    os.environ["HF_HUB_OFFLINE"] = "1"
    ```

---

## **How to Use**

### **A. Prepare Embeddings (Run after changing `verb_brain_map.csv`)**

```sh
python prepare_embeddings.py
```

### **B. Run the Main Application (Interactive Mode)**

```sh
python app.py
```
- Enter a verb when prompted.  
- The program will show the closest known verb and the associated brain regions.

### **C. Batch Test (Test Multiple Inputs)**

```sh
python batch_test.py
```
- This will read test cases from `test_verbs.txt` and print the results and accuracy.

---

## **Project Structure**

```
baldmann_new/
│
├── app.py
├── batch_test.py
├── prepare_embeddings.py
├── requirements.txt
│
├── data/
│   └── verb_brain_map.csv
│
├── models/
│   └── dataset_embeddings.npy
│
├── utils/
│   └── semantic_utils.py
│
└── test_verbs.txt
```

---

## **Troubleshooting**

- **Model Download Errors:**  
  Make sure you are online the first time you run the scripts. After the model is cached, you can use the program offline.
- **NLTK Data Errors:**  
  If you see errors about missing `wordnet` or `omw-1.4`, run the NLTK download commands above.
- **Offline Use:**  
  If you move the project to another device, copy the Hugging Face cache folder as well:
    - Windows: `C:\Users\<YourUsername>\.cache\huggingface\hub`
    - NLTK data: `C:\Users\<YourUsername>\AppData\Roaming\nltk_data`

---

## **License**

This project is for research and educational purposes.