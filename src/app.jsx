import { useEffect, useState } from "react";
import {
  AiOutlineCamera,
  AiOutlineClose,
  AiOutlineDownload,
  AiOutlineScissor,
} from "react-icons/ai";

import Croppie from "croppie";
import "croppie/croppie.css";
import "./style.scss";

// Document and Crop Config
const DocW = 4500;
const DocH = 5750;
const Cropy = 3300;
const Cropx = 400;
const CropH = 1650;
const CropW = 1650;

// Create the crop area element outside of the component
let CropArea = null;
let c = null;
let bg = null;

export function App() {
  const [cropVis, setCropVis] = useState(false);
  const [BgLoadStatus, setBgLoadStatus] = useState(null);
  const [CroppedImg, setCroppedImg] = useState(null);
  const [CroppedImgStatus, setCroppedImgStatus] = useState(null);
  const [GeneratedData, setGeneratedData] = useState(null);
  const [PreviewAct, setPreviewAct] = useState(null);
  const [Name, setName] = useState("");
  const [Class, setClass] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize components on mount
  useEffect(() => {
    // Create the crop area element
    CropArea = document.createElement("div");
    
    // Initialize background image
    bg = new Image();
    bg.src = "./frame.png";
    bg.onload = () => {
      setBgLoadStatus(1);
      setIsLoading(false);
    };
    
    // Handle errors in loading the background
    bg.onerror = () => {
      console.error("Failed to load background image");
      setIsLoading(false);
    };
    
    // Cleanup on unmount
    return () => {
      if (c) {
        c.destroy();
        c = null;
      }
      CropArea = null;
    };
  }, []);

  useEffect(() => {
    if (CroppedImg) {
      const CroppedImgTag = new Image();
      CroppedImgTag.src = CroppedImg;
      CroppedImgTag.onload = () => {
        setCroppedImgStatus(1);
      };
    }
  }, [CroppedImg]);

  useEffect(() => {
    if (BgLoadStatus && CroppedImgStatus) {
      draw();
    }
  }, [BgLoadStatus, CroppedImgStatus, Name, Class]);

  function draw() {
    let _canv = document.createElement("canvas");
    let _ctx = _canv.getContext("2d");
    _canv.width = DocW;
    _canv.height = DocH;
    
    let CroppedImgTag = new Image();
    CroppedImgTag.src = CroppedImg;

    CroppedImgTag.onload = () => {
      _ctx.clearRect(0, 0, _canv.width, _canv.height);
      _ctx.drawImage(CroppedImgTag, Cropx, Cropy, CropW, CropH);
      _ctx.drawImage(bg, 0, 0, _canv.width, _canv.height);

      _ctx.fillStyle = "black";

      let _name = Name.split(" ")
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
        .join(" ");
      let _class = `${Class}`;

      _ctx.textAlign = "left";
      _ctx.font = "400 170px Montserrat, sans-serif";
      _ctx.fillText(_name, Cropx + 10, Cropy + CropH + 70);
      _ctx.font = "600 140px Montserrat, sans-serif";

      setGeneratedData(_canv.toDataURL({ pixelRatio: 3 }));
    };
  }

  const handleFileUpload = () => {
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*"; // Accept only images
    
    file.onchange = () => {
      if (file.files && file.files[0]) {
        let _file = file.files[0];
        let fileReader = new FileReader();
        fileReader.readAsDataURL(_file);
        fileReader.onload = () => {
          Crop(fileReader.result);
        };
      }
    };
    
    file.click();
  };

  function Crop(imageData) {
    // Ensure CropArea is initialized
    if (!CropArea) {
      CropArea = document.createElement("div");
    }
    
    setCropVis(true);
    
    // If there's an existing cropper, destroy it first
    if (c) {
      c.destroy();
    }
    
    // Use setTimeout to ensure the DOM is ready
    setTimeout(() => {
      try {
        c = new Croppie(CropArea, {
          url: imageData,
          enableOrientation: true,
          enableZoom: true,
          enableResize: true,
          viewport: {
            height: CropH / 3, // Smaller for mobile
            width: CropW / 3,  // Smaller for mobile
            type: "square",
          },
          boundary: {
            height: CropH / 2.5,
            width: CropW / 2.5,
          }
        });
      } catch (error) {
        console.error("Error initializing Croppie:", error);
        setCropVis(false);
      }
    }, 100);
  }

  function Preview() {
    return (
      <>
        {PreviewAct && (
          <div onClick={() => setPreviewAct(false)} className="preview">
            <img src={GeneratedData} alt="Preview" />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div
            style={{
              backgroundImage: `url(${GeneratedData || (bg ? bg.src : "")})`,
            }}
            className="Header"
          ></div>

          <div className="Cont">
            <div className="form-inputs">
              <input
                type="text"
                placeholder="Enter Name"
                value={Name}
                onChange={(e) => setName(e.target.value)}
                className="name-input"
              />
            </div>
            
            <div className="Actions">
              {GeneratedData ? (
                <div className="button-group">
                  <button onClick={() => setPreviewAct(true)} className="preview-button">
                    <span>Preview</span>
                  </button>
                  <a href={GeneratedData} download="StatusPoster">
                    <button className="download-button">
                      <AiOutlineDownload size="30" />
                      <span>Download Status</span>
                    </button>
                  </a>
                  <button onClick={handleFileUpload} className="upload-button">
                    <AiOutlineCamera size="30" />
                    <span>Change Photo</span>
                  </button>
                </div>
              ) : (
                <div className="flex-column">
                  <button onClick={handleFileUpload} className="upload-button">
                    <AiOutlineCamera size="30" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <Preview />
          <Cropper
            setCroppedImg={setCroppedImg}
            visible={cropVis}
            set={setCropVis}
          />
        </>
      )}
    </>
  );
}

function Cropper({ visible, set, setCroppedImg }) {
  const [cropperReady, setCropperReady] = useState(false);

  // Use useEffect to handle cropper DOM manipulations
  useEffect(() => {
    if (visible) {
      setCropperReady(true);
    }
  }, [visible]);

  // Handle cropping
  const handleCrop = () => {
    if (c) {
      c.result({ 
        type: 'canvas', 
        size: { 
          width: CropW, 
          height: CropH 
        },
        format: 'png',
        quality: 1
      }).then((result) => {
        setCroppedImg(result);
        c.destroy();
        c = null;
        set(false);
      }).catch(err => {
        console.error("Error cropping image:", err);
        set(false);
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (c) {
      c.destroy();
      c = null;
    }
    set(false);
  };

  return (
    <div className={visible ? "cropper-container visible" : "cropper-container hidden"}>
      <div className="cropper-wrapper">
        <div
          ref={(e) => {
            if (e && visible && cropperReady) {
              e.innerHTML = '';
              e.appendChild(CropArea);
            }
          }}
          className="Crop"
        ></div>
        <div className="Tools">
          <button onClick={handleCancel} className="cancel-button">
            <AiOutlineClose size="30" />
            <span>Cancel</span>
          </button>
          <button onClick={handleCrop} className="crop-button">
            <AiOutlineScissor size="30" />
            <span>Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
}