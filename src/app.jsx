import { useEffect, useState, useRef } from "react";
import Croppie from "croppie";
import "croppie/croppie.css";
import { AiOutlineCamera, AiOutlineClose, AiOutlineDownload, AiOutlineScissor } from "react-icons/ai";

// Document and Crop Config
const DocW = 4500;
const DocH = 5750;
const Cropy = 3300;
const Cropx = 400;
const CropH = 1650;
const CropW = 1650;

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
  const [imageData, setImageData] = useState(null);
  
  // Refs for persistent values
  const bgRef = useRef(null);
  const cropAreaRef = useRef(null);
  const croppieRef = useRef(null);

  // Initialize components on mount
  useEffect(() => {
    // Create the crop area element
    cropAreaRef.current = document.createElement("div");
    
    // Initialize background image
    bgRef.current = new Image();
    bgRef.current.src = "./frame.png";
    bgRef.current.onload = () => {
      setBgLoadStatus(1);
      setIsLoading(false);
    };
    
    // Handle errors in loading the background
    bgRef.current.onerror = () => {
      console.error("Failed to load background image");
      setIsLoading(false);
    };
    
    // Cleanup on unmount
    return () => {
      if (croppieRef.current) {
        croppieRef.current.destroy();
        croppieRef.current = null;
      }
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
    const _canv = document.createElement("canvas");
    const _ctx = _canv.getContext("2d");
    _canv.width = DocW;
    _canv.height = DocH;
    
    const CroppedImgTag = new Image();
    CroppedImgTag.src = CroppedImg;

    CroppedImgTag.onload = () => {
      _ctx.clearRect(0, 0, _canv.width, _canv.height);
      _ctx.drawImage(CroppedImgTag, Cropx, Cropy, CropW, CropH);
      _ctx.drawImage(bgRef.current, 0, 0, _canv.width, _canv.height);

      _ctx.fillStyle = "black";

      const _name = Name.split(" ")
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
        .join(" ");
      const _class = `${Class}`;

      _ctx.textAlign = "left";
      _ctx.font = "600 170px Montserrat, sans-serif";
      _ctx.fillText(_name, Cropx + CropW + 50, Cropy + CropH - CropH / 3 - 30);
      _ctx.font = "600 140px Montserrat, sans-serif";
      _ctx.fillText(_class, Cropx + CropW + 50, Cropy + CropH + 10 - CropH / 4);

      setGeneratedData(_canv.toDataURL({ pixelRatio: 3 }));
    };
  }

  const handleFileUpload = () => {
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    
    file.onchange = () => {
      if (file.files && file.files[0]) {
        const _file = file.files[0];
        const fileReader = new FileReader();
        fileReader.readAsDataURL(_file);
        fileReader.onload = () => {
          setImageData(fileReader.result);
          setCropVis(true);
        };
      }
    };
    
    file.click();
  };

  return (
    <>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div
            style={{
              backgroundImage: `url(${GeneratedData || (bgRef.current ? bgRef.current.src : "")})`,
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
              <input
                type="text"
                placeholder="Enter Class/Section"
                value={Class}
                onChange={(e) => setClass(e.target.value)}
                className="class-input"
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

          {PreviewAct && (
            <div onClick={() => setPreviewAct(false)} className="preview">
              <img src={GeneratedData} alt="Preview" />
            </div>
          )}
          
          <div className={cropVis ? "vi" : "hi"}>
            <div
              ref={(e) => {
                if (e && cropVis && imageData) {
                  e.innerHTML = '';
                  e.appendChild(cropAreaRef.current);
                  
                  // Initialize Croppie with a slight delay to ensure DOM is ready
                  setTimeout(() => {
                    try {
                      if (croppieRef.current) {
                        croppieRef.current.destroy();
                      }
                      croppieRef.current = new Croppie(cropAreaRef.current, {
                        url: imageData,
                        enableOrientation: true,
                        enableZoom: true,
                        enableResize: true,
                        viewport: {
                          height: CropH / 3,
                          width: CropW / 3,
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
              }}
              className="Crop"
            ></div>
            <div className="Tools">
              <button 
                onClick={() => {
                  if (croppieRef.current) {
                    croppieRef.current.destroy();
                    croppieRef.current = null;
                  }
                  setCropVis(false);
                }} 
                className="cancel-button"
              >
                <AiOutlineClose size="30" />
                <span>Cancel</span>
              </button>
              <button 
                onClick={() => {
                  if (croppieRef.current) {
                    croppieRef.current.result({ 
                      type: 'canvas', 
                      size: { 
                        width: CropW, 
                        height: CropH 
                      },
                      format: 'png',
                      quality: 1
                    }).then((result) => {
                      setCroppedImg(result);
                      croppieRef.current.destroy();
                      croppieRef.current = null;
                      setCropVis(false);
                    }).catch(err => {
                      console.error("Error cropping image:", err);
                      setCropVis(false);
                    });
                  }
                }} 
                className="crop-button"
              >
                <AiOutlineScissor size="30" />
                <span>Crop</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}