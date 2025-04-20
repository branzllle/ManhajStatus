import React, { useState, useEffect, useRef } from 'react';
import Croppie from 'croppie';
import './style.scss'; // Import the new SCSS file

// Document and Crop Config (Consider making these dynamic)
const DocW = 4500;
const DocH = 5750;
const Cropy = 3300;
const Cropx = 400;
const CropH = 1650;
const CropW = 1650;

const App = () => {
  const [cropVis, setCropVis] = useState(false);
  const [bgLoadStatus, setBgLoadStatus] = useState(null);
  const [croppedImg, setCroppedImg] = useState(null);
  const [croppedImgStatus, setCroppedImgStatus] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [previewAct, setPreviewAct] = useState(null);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const cropAreaRef = useRef(null);
  const croppieInstanceRef = useRef(null);

  useEffect(() => {
    const bg = new Image();
    bg.src = './frame.png';
    bg.onload = () => {
      setBgLoadStatus(1);
      setIsLoading(false);
    };
    bg.onerror = () => {
      console.error('Failed to load background image');
      setIsLoading(false);
    };

    return () => {
      if (croppieInstanceRef.current) {
        croppieInstanceRef.current.destroy();
        croppieInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (croppedImg) {
      const img = new Image();
      img.src = croppedImg;
      img.onload = () => setCroppedImgStatus(1);
    }
  }, [croppedImg]);

  useEffect(() => {
    if (bgLoadStatus && croppedImgStatus) {
      draw();
    }
  }, [bgLoadStatus, croppedImgStatus, name, className]);

  const draw = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = DocW;
    canvas.height = DocH;

    const img = new Image();
    img.src = croppedImg;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, Cropx, Cropy, CropW, CropH);

      const bg = new Image();
      bg.src = './frame.png';
      bg.onload = () => {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'black';

        const displayName = name
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        const displayClass = `${className}`;

        ctx.textAlign = 'left';
        ctx.font = '600 170px Montserrat, sans-serif';
        ctx.fillText(displayName, Cropx + CropW + 50, Cropy + CropH - CropH / 3 - 30);
        ctx.font = '600 140px Montserrat, sans-serif';
        ctx.fillText(displayClass, Cropx + CropW + 50, Cropy + CropH + 10 - CropH / 4);

        setGeneratedData(canvas.toDataURL({ pixelRatio: 3 }));
      };
    };
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => Crop(e.target.result);
        reader.readAsDataURL(e.target.files[0]);
      }
    };
    input.click();
  };

  const Crop = (imageData) => {
    setCropVis(true);
    if (croppieInstanceRef.current) {
      croppieInstanceRef.current.destroy();
      croppieInstanceRef.current = null;
    }

    setTimeout(() => {
      try {
        croppieInstanceRef.current = new Croppie(cropAreaRef.current, {
          url: imageData,
          enableOrientation: true,
          enableZoom: true,
          enableResize: true,
          viewport: {
            height: CropH / 3,
            width: CropW / 3,
            type: 'square',
          },
          boundary: {
            height: CropH / 2.5,
            width: CropW / 2.5,
          },
        });
      } catch (error) {
        console.error('Error initializing Croppie:', error);
        setCropVis(false);
      }
    }, 100);
  };

  const Preview = () =>
    previewAct && (
      <div onClick={() => setPreviewAct(false)} className="preview">
        <img src={generatedData} alt="Preview" />
      </div>
    );

  const Cropper = () => {
    const handleCrop = () => {
      if (croppieInstanceRef.current) {
        croppieInstanceRef.current
          .result({
            type: 'canvas',
            size: { width: CropW, height: CropH },
            format: 'png',
            quality: 1,
          })
          .then((result) => {
            setCroppedImg(result);
            croppieInstanceRef.current.destroy();
            croppieInstanceRef.current = null;
            setCropVis(false);
          })
          .catch((err) => {
            console.error('Error cropping:', err);
            setCropVis(false);
          });
      }
    };

    const handleCancel = () => {
      if (croppieInstanceRef.current) {
        croppieInstanceRef.current.destroy();
        croppieInstanceRef.current = null;
      }
      setCropVis(false);
    };

    return (
      <div className={cropVis ? 'cropper-container visible' : 'cropper-container hidden'}>
        <div className="cropper-wrapper">
          <div ref={cropAreaRef} className="Crop" />
          <div className="Tools">
            <button onClick={handleCancel} className="cancel-button">
              <AiOutlineClose size={30} />
              <span>Cancel</span>
            </button>
            <button onClick={handleCrop} className="crop-button">
              <AiOutlineScissor size={30} />
              <span>Crop</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div
            style={{
              backgroundImage: `url(${generatedData || (bgLoadStatus ? './frame.png' : '')})`,
            }}
            className="Header"
          />
          <div className="Cont">
            <div className="form-inputs">
              <input
                type="text"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="name-input"
              />
              <input
                type="text"
                placeholder="Enter Class/Section"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="class-input"
              />
            </div>
            <div className="Actions">
              {generatedData ? (
                <div className="button-group">
                  <button onClick={() => setPreviewAct(true)} className="preview-button">
                    <span>Preview</span>
                  </button>
                  <a href={generatedData} download="StatusPoster">
                    <button className="download-button">
                      <AiOutlineDownload size={30} />
                      <span>Download Status</span>
                    </button>
                  </a>
                  <button onClick={handleFileUpload} className="upload-button">
                    <AiOutlineCamera size={30} />
                    <span>Change Photo</span>
                  </button>
                </div>
              ) : (
                <div className="flex-column">
                  <button onClick={handleFileUpload} className="upload-button">
                    <AiOutlineCamera size={30} />
                    <span>Upload Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <Preview />
          <Cropper />
        </>
      )}
    </>
  );
};

export default App;
