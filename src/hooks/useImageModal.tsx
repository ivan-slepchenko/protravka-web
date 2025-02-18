import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, Image } from "@chakra-ui/react";
import { useTranslation } from 'react-i18next';

const useImageModal = () => {
    const { t } = useTranslation();
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handlePhotoClick = (photoUrl: string | null) => {
        setSelectedPhoto(photoUrl);
    };

    const handleClose = () => {
        setSelectedPhoto(null);
    };

    const ImageModal: React.FC<{ selectedPhoto: string | null, handleClose: () => void }> = ({ selectedPhoto, handleClose }) => (
        <Modal isOpen={!!selectedPhoto} onClose={handleClose} size={{base: "full", md: "unset"}}>
            <ModalOverlay />
            <ModalContent width="800px" height="600px" maxWidth="unset" p="6">
                <ModalCloseButton />
                <ModalBody>
                    {selectedPhoto && (
                        <Image
                            src={selectedPhoto}
                            alt={t('use_image_modal.full_size')}
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

    const ImageWithModal: React.FC<{ src: string | Blob; fullSize?: boolean }> = ({ src, fullSize = false }) => {
        const imageUrl = typeof src === "string" ? src : URL.createObjectURL(src);
        return (
            <Image
                src={imageUrl}
                alt={t('use_image_modal.thumbnail')}
                width={fullSize ? "100%" : "150px"}
                height={fullSize ? "100%" : "100px"}
                objectFit={"cover"}
                onClick={() => handlePhotoClick(imageUrl)}
                cursor="pointer"
                title={t('use_image_modal.click_to_view_full_size')}
            />
        );
    };

    ImageWithModal.propTypes = {
        src: PropTypes.any.isRequired,
        fullSize: PropTypes.bool,
    };

    return { ImageModal, ImageWithModal, selectedPhoto, handleClose };
};

export default useImageModal;
