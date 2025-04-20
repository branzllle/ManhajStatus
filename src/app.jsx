import { useEffect, useState, useRef } from "react";
import {
  AiOutlineCamera,
  AiOutlineClose,
  AiOutlineDownload,
  AiOutlineScissor,
} from "react-icons/ai";

import Croppie from "croppie";
import "croppie/croppie.css";
import "./style.scss";

// Document and Crop Config (Consider making these dynamic or more responsive)
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
  const cropAreaRef = useRef(null); // Ref for the Croppie container
  const croppieInstance = useRef(null); // Ref to hold the Croppie instance

  useEffect(() => {
    // Initialize background image
    const bg = new Image();
    bg.src = "./frame.png";
    bg.onload = () => {
      setBgLoadStatus(1);
      setIsLoading(false);
    };

    bg.onerror = () => {
      console.error("Failed to load background image");
      setIsLoading(false);
    };

    // Cleanup on unmount
    return () => {
      if (croppieInstance.current) {
        croppieInstance.current.destroy();
        croppieInstance.current = null;
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

      const bg = new Image();
      bg.src = "./frame.png"; // Ensure background is loaded again for drawing
      bg.onload = () => {
        _ctx.drawImage(bg, 0, 0, _canv.width, _canv.height);

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
          Crop(fileReader.result);
        };
      }
    };

    file.click();
  };

  function Crop(imageData) {
    setCropVis(true);

    // If there's an existing cropper, destroy it first
    if (croppieInstance.current) {
      croppieInstance.current.destroy();
      croppieInstance.current = null;
    }

    // Use setTimeout to ensure the DOM is ready
    setTimeout(() => {
      try {
        croppieInstance.current = new Croppie(cropAreaRef.current, {
          url: imageData,
          enableOrientation: true,
          enableZoom: true,
          enableResize: true,
          viewport: {
            height: CropH / 3, // Smaller for mobile
            width: CropW / 3,   // Smaller for mobile
            type: "square",
          },
          boundary: {
            height: CropH / 2.5,
            width: CropW / 2.5,
          },
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
              backgroundImage: `url(${GeneratedData || (BgLoadStatus ? "./frame.png" : "")})`,
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
            cropAreaRef={cropAreaRef}
            croppieInstance={croppieInstance}
            CropH={CropH}
            CropW={CropW}
          />
        </>
      )}
    </>
  );
}

function Cropper({ visible, set, setCroppedImg, cropAreaRef, croppieInstance, CropH, CropW }) {
  const [cropperReady, setCropperReady] = useState(false);

  useEffect(() => {
    if (visible) {
      setCropperReady(true);
    }
  }, [visible]);

  const handleCrop = () => {
    if (croppieInstance.current) {
      croppieInstance.current
        .result({
          type: 'canvas',
          size: {
            width: CropW,
            height: CropH
          },
          format: 'png',
          quality: 1
        })
        .then((result) => {
          setCroppedImg(result);
          croppieInstance.current.destroy();
          croppieInstance.current = null;
          set(false);
        })
        .catch(err => {
          console.error("Error cropping image:", err);
          set(false);
        });
    }
  };

  const handleCancel = () => {
    if (croppieInstance.current) {
      croppieInstance.current.destroy();
      croppieInstance.current = null;
    }
    set(false);
  };

  return (
    <div className={visible ? "cropper-container visible" : "cropper-container hidden"}>
      <div className="cropper-wrapper">
        <div
          ref={cropAreaRef}
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