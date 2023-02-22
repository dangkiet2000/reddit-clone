import React, { useState } from "react";

const useSelectFile = () => {
  const [selectedFile, setSelectedFile] = useState<string>();

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();

    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]); // Read file asynchronously
    }

    // It will trigger reader.readAsDataURl completed
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        // as string because result has two types string and bufferArray => as strign to only choose string type
        setSelectedFile(readerEvent.target.result as string);
      }
    };
  };

  return {
    onSelectFile,
    selectedFile,
    setSelectedFile,
  };
};
export default useSelectFile;
