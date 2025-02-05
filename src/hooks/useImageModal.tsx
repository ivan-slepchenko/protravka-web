import { useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Image } from "@chakra-ui/react";

const useImageModal = () => {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handlePhotoClick = (photoUrl: string | null) => {
        setSelectedPhoto(photoUrl);
    };

    const handleClose = () => {
        setSelectedPhoto(null);
    };

    const ImageModal: React.FC<{ selectedPhoto: string | null, handleClose: () => void }> = ({ selectedPhoto, handleClose }) => (
        <Modal isOpen={!!selectedPhoto} onClose={handleClose}>
            <ModalOverlay />
            <ModalContent width="800px" height="600px" maxWidth="unset" p="6">
                <ModalCloseButton />
                <ModalBody>
                    {selectedPhoto && (
                        <Image
                            src={selectedPhoto}
                            alt="Full Size"
                            width="full"
                            height="full"
                            objectFit="cover"
                        />
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );

    ImageModal.propTypes = {
        selectedPhoto: PropTypes.string,
        handleClose: PropTypes.func.isRequired,
    };

    const ImageWithModal: React.FC<{ src: string, fullSize?: boolean }> = ({ src, fullSize = false }) => (
        <Image
            src={src}
            alt="Thumbnail"
            width={fullSize ? "100%" : "150px"}
            height={fullSize ? "100%" : "100px"}
            objectFit={fullSize ? "contain" : "cover"}
            onClick={() => handlePhotoClick(src)}
            cursor="pointer"
            title="Click to view full size"
        />
    );

    ImageWithModal.propTypes = {
        src: PropTypes.string.isRequired,
        fullSize: PropTypes.bool,
    };

    return { ImageModal, ImageWithModal, selectedPhoto, handleClose };
};

export default useImageModal;
