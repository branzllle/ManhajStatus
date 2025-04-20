import { useEffect, useState } from "preact/hooks";
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

let CropArea = document.createElement("div");
let c;
let bg = new Image();
bg.src = "./frame.png";

export function App() {
  const [cropVis, setcropVis] = useState(false);
  const [BgLoadStatus, setBgLoadStatus] = useState(null);
  const [CroppedImg, setCroppedImg] = useState(null);
  const [CroppedImgStatus, setCroppedImgStatus] = useState(null);
  const [GeneratedData, setGeneratedData] = useState(null);
  const [PreviewAct, setPreviewAct] = useState(null);
  const [Name, setName] = useState("");
  const [Class, setClass] = useState("");

  let _canv = document.createElement("canvas");
  let _ctx = _canv.getContext("2d");
  _canv.width = DocW;
  _canv.height = DocH;

  bg.onload = () => setBgLoadStatus(1);

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
  }, [CroppedImgStatus]);

  function draw() {
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
      _ctx.font = "600 170px Montserrat, sans-serif";
      _ctx.fillText(_name, Cropx + CropW + 50, Cropy + CropH - CropH / 3 - 30);
      _ctx.font = "600 140px Montserrat, sans-serif";
      _ctx.fillText(_class, Cropx + CropW + 50, Cropy + CropH + 10 - CropH / 4);

      setGeneratedData(_canv.toDataURL({ pixelRatio: 3 }));
    };
  }

  const file = document.createElement("input");
  file.type = "file";
  let Img;

  file.onchange = () => {
    let _file = file.files[0];
    let fileReader = new FileReader();
    fileReader.readAsDataURL(_file);
    fileReader.onload = () => {
      Img = fileReader.result;
      Crop();
    };
  };

  function Crop() {
    setcropVis(true);
    c = new Croppie(CropArea, {
      url: Img,
      enableOrientation: true,
      viewport: {
        height: CropH / 2,
        width: CropW / 2,
        type: "square",
      },
    });
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
      <div
        style={{
          backgroundImage: `url(${GeneratedData || bg.src})`,
        }}
        className="Header"
      ></div>

      <div className="Cont">
        <div className="Actions">
          {GeneratedData ? (
            <div>
              <a href={GeneratedData} download="StatusPoster">
                <button>
                  <AiOutlineDownload size="30" />
                  <span>Download Status</span>
                </button>
              </a>
            </div>
          ) : (
            <div className="flex-column">
              <button onClick={() => file.click()}>
                <AiOutlineCamera size="30" />
                <span>Upload Photo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        ref={(e) => {
          if (e) e.innerHTML = "";
        }}
      ></div>

      <Preview />
      <Cropper
        setCroppedImg={setCroppedImg}
        visible={cropVis}
        set={setcropVis}
      />
    </>
  );
}

function Cropper({ visible, set, setCroppedImg }) {
  return (
    <div className={visible ? "vi" : "hi"}>
      <div
        ref={(e) => {
          if (e) {
            e.innerHTML = "";
            e.append(CropArea);
          }
        }}
        className="Crop"
      ></div>
      <div className="Tools">
        <button
          onClick={() => {
            c.destroy();
            set(false);
          }}
        >
          <AiOutlineClose size="30" />
        </button>
        <button
          onClick={() => {
            c.result({ size: { height: CropH, width: CropW } }).then((e) => {
              setCroppedImg(e);
              c.destroy();
              set(false);
            });
          }}
        >
          <AiOutlineScissor size="30" />
        </button>
      </div>
    </div>
  );
}
