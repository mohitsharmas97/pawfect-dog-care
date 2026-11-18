from pathlib import Path
import io, logging, threading
from typing import Any
log=logging.getLogger("pawfect.inference")
MODEL_DIR=Path(__file__).resolve().parent.parent/"models"
CHECKPOINTS={"eye":MODEL_DIR/"dog_eye_efficientnet_b0_v1.pth","skin":MODEL_DIR/"dog_skin_efficientnet_b0.pth"}
THRESHOLDS={"eye":0.70,"skin":0.60}
class ModelRegistry:
 def __init__(self): self.models={}; self.errors={}; self._torch=None; self._lock=threading.Lock()
 def _torch_load(self,torch,path):
  try: return torch.load(path,map_location="cpu",weights_only=False)
  except TypeError: return torch.load(path,map_location="cpu")
 def _load_one(self,kind,path,torch,nn,models,transforms):
  if not path.is_file(): raise FileNotFoundError(f"Checkpoint not found: {path}. Copy the notebook export into backend/models/.")
  ckpt=self._torch_load(torch,path)
  if not isinstance(ckpt,dict): raise ValueError("Expected notebook checkpoint dictionary.")
  state=ckpt.get("model_state"); classes=ckpt.get("class_names")
  if state is None and isinstance(ckpt,dict) and all(isinstance(v,torch.Tensor) for v in ckpt.values()): raise ValueError("Raw state_dict detected. Re-run the notebook final export cell to create the dictionary checkpoint with model_state and class_names.")
  if not isinstance(state,dict): raise ValueError("Checkpoint is missing model_state.")
  if not isinstance(classes,(list,tuple)) or not classes: raise ValueError("Checkpoint is missing class_names.")
  classes=[str(x) for x in classes]
  if len(set(classes))!=len(classes): raise ValueError("Duplicate class names in checkpoint.")
  arch=str(ckpt.get("arch","efficientnet_b0")).lower()
  if arch!="efficientnet_b0": raise ValueError(f"Unsupported architecture {arch}; expected efficientnet_b0.")
  size=int(ckpt.get("img_size",224)); mean=ckpt.get("mean",[.485,.456,.406]); std=ckpt.get("std",[.229,.224,.225])
  model=models.efficientnet_b0(weights=None); model.classifier=nn.Sequential(nn.Dropout(.3),nn.Linear(1280,len(classes)))
  try: model.load_state_dict(state,strict=True)
  except RuntimeError as e: raise ValueError(f"Weights do not match EfficientNet-B0 classifier: {e}") from e
  model.eval(); tf=transforms.Compose([transforms.Resize((size,size)),transforms.ToTensor(),transforms.Normalize(mean,std)])
  return {"model":model,"classes":classes,"transform":tf,"threshold":THRESHOLDS[kind],"metadata":{"arch":arch,"img_size":size,"class_count":len(classes),"checkpoint":path.name,"test_acc":ckpt.get("test_acc") if kind=="eye" else ckpt.get("clean_test_acc")}}
 def load(self):
  with self._lock:
   self.models.clear(); self.errors.clear()
   try:
    import torch,torch.nn as nn
    from torchvision import models,transforms
    self._torch=torch
   except Exception as e:
    msg=f"PyTorch/torchvision import failed: {type(e).__name__}: {e}"
    self.errors={k:msg for k in CHECKPOINTS}; log.exception(msg); return
   for kind,path in CHECKPOINTS.items():
    try: self.models[kind]=self._load_one(kind,path,torch,nn,models,transforms); log.info("Loaded %s checkpoint %s",kind,path)
    except Exception as e: self.errors[kind]=f"{type(e).__name__}: {e}"; log.exception("Could not load %s model",kind)
 def status(self):
  out={}
  for k,p in CHECKPOINTS.items():
   d={"status":"loaded" if k in self.models else "error","checkpoint":p.name,"exists":p.is_file()}
   d.update(self.models[k]["metadata"] if k in self.models else {"error":self.errors.get(k,"Not loaded")}); out[k]=d
  return out
 def predict(self,kind,image_bytes):
  if kind not in CHECKPOINTS: raise ValueError("Use eye or skin model.")
  if kind not in self.models: raise RuntimeError(self.errors.get(kind,"Model is not loaded."))
  from PIL import Image
  try:
   with Image.open(io.BytesIO(image_bytes)) as im: image=im.convert("RGB")
  except Exception as e: raise ValueError("Could not decode image. Upload a valid JPG, PNG or WEBP.") from e
  cfg=self.models[kind]; x=cfg["transform"](image).unsqueeze(0)
  with self._torch.inference_mode(): probs=self._torch.softmax(cfg["model"](x).float(),dim=1)[0].cpu().tolist()
  top=max(range(len(probs)),key=probs.__getitem__); conf=float(probs[top])
  return {"prediction":cfg["classes"][top],"confidence":conf,"uncertain":conf<cfg["threshold"],"all_probs":{n:float(v) for n,v in zip(cfg["classes"],probs)},"probability_sum":float(sum(probs)),"threshold":cfg["threshold"],"model":"efficientnet_b0","mode":"model","checkpoint":cfg["metadata"]["checkpoint"],"image_size":list(image.size)}
registry=ModelRegistry()
