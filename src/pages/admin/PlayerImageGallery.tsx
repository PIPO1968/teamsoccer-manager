import React from "react";
import { playerImageCatalog } from "@/data/playerImageCatalog";

const PlayerImageGallery: React.FC = () => {
    return (
        <div style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Galería de Imágenes de Jugadores</h1>
            {Object.entries(playerImageCatalog).map(([pais, datos]) => (
                <div key={pais} style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 20, marginBottom: 8 }}>{pais} <span style={{ fontSize: 14, color: '#888' }}>({datos.rasgo})</span></h2>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {datos.imagenes.map((img, idx) => (
                            <div key={img} style={{ textAlign: "center" }}>
                                <img src={img} alt={pais + " " + (idx + 1)} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }} />
                                <div style={{ fontSize: 12, marginTop: 4 }}>{img.split("/").pop()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlayerImageGallery;
