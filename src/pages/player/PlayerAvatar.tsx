


// En el futuro, aquí puedes cambiar la imagen por la que corresponda al jugador
// Por ahora, mostramos players3.png como avatar por defecto
return (
  <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-blue-100 via-blue-50 to-white w-full sm:w-[180px] border-r border-blue-100 py-8 px-3">
    <span className="relative inline-flex items-center justify-center border-2 border-blue-200 rounded-xl bg-white w-[104px] h-[128px] shadow-inner mb-2">
      <img
        src={"/teamsoccer-assets/players3.png"}
        alt="Avatar jugador"
        className="object-cover w-[96px] h-[120px] rounded-lg"
      />
    </span>
    <a href="#" className="text-blue-600 underline text-xs hover:text-blue-800">Edit avatar</a>
  </div>
);
}
