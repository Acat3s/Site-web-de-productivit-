import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://thppgtwjjnrlevnwergb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocHBndHdqam5ybGV2bndlcmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3OTY1NDEsImV4cCI6MjA1NTM3MjU0MX0.1coSAD46iOwT4m3kMOvC7biSA9XDquXt0FqvLyKd5dk"
);

const VideoStorageApp = () => {
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    fetchVideos();
    fetchImages();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase.from("videos").select("id, url");
    if (error) {
      console.error("Erreur lors de la récupération des vidéos :", error);
    } else {
      setVideos(data || []);
    }
  };

  const addImage = async () => {
    const url = prompt("Entre l'URL de l'image :");
    if (url) {
      const { data, error } = await supabase.from("images").insert([{ url }]);
      if (error) {
        console.error("Erreur lors de l'ajout de l'image :", error);
      } else {
        setImages([...images, { id: data[0].id, url }]);
      }
    }
  };
  

  const fetchImages = async () => {
    const { data, error } = await supabase.from("images").select("id, url");
    if (error) {
      console.error("Erreur lors de la récupération des images :", error);
    } else {
      setImages(data || []);
    }
  };

  const addVideo = async () => {
    const url = prompt("Entre l'URL de la vidéo :");
    if (url) {
      const { data, error } = await supabase.from("videos").insert([{ url }]).select();
      if (error) {
        console.error("Erreur lors de l'ajout de la vidéo :", error);
      } else {
        setVideos([...videos, ...data]);
      }
    }
  };

  const removeVideo = async (id) => {
    const { error } = await supabase.from("videos").delete().match({ id });
    if (error) {
      console.error("Erreur lors de la suppression de la vidéo :", error);
    } else {
      setVideos(videos.filter((video) => video.id !== id));
    }
  };

  const isOneUpload = (url) => url.includes("oneupload.net");
  const isSibnet = (url) => url.includes("sibnet.ru");
  const isYouTube = (url) => url.includes("youtube.com") || url.includes("youtu.be");

  const VideoComponent = ({ url }) => {
    if (isOneUpload(url)) {
      return <iframe src={url} width="600" height="340" allowFullScreen></iframe>;
    } else if (isSibnet(url)) {
      return <iframe src={url} width="600" height="340" allowFullScreen></iframe>;
    } else if (isYouTube(url)) {
      const videoId = new URL(url).searchParams.get("v");
      return <iframe src={`https://www.youtube.com/embed/${videoId}`} width="600" height="340" allowFullScreen></iframe>;
    } else {
      return (
        <video width="600" controls>
          <source src={url} type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
      );
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>📁 Media Storage</h1>
      <button onClick={() => setActiveTab("videos")} disabled={activeTab === "videos"}>📹 Vidéos</button>
      <button onClick={() => setActiveTab("images")} disabled={activeTab === "images"}>🖼 Images</button>
      {activeTab === "videos" ? (
        <>
          <button onClick={addVideo}>➕ Ajouter une vidéo</button>
          <div>
            {videos.map((video) => (
              <div key={video.id} style={{ margin: "20px", textAlign: "center" }}>
                <VideoComponent url={video.url} />
                <button onClick={() => removeVideo(video.id)} style={{ marginTop: "10px", backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>
                  🗑 Supprimer
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button onClick={addImage}>➕ Ajouter une image</button>
          <div>
            {images.map((image) => (
              <div key={image.id} style={{ margin: "20px", textAlign: "center" }}>
                <img src={image.url} alt="Stored" width="400" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoStorageApp;
