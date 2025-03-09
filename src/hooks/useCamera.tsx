import React, { useRef, useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Select, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const useCamera = () => {
    const { t } = useTranslation();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(localStorage.getItem('selectedDeviceId'));
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);

    const initDevices = async () => {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            console.info('Camera permission:', permissionStatus.state);
            if (permissionStatus.state === 'denied') {
                setIsWarningOpen(true);
                return;
            }

            const constraints = { video: { facingMode: "environment" } };
            await navigator.mediaDevices.getUserMedia(constraints);
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === 'videoinput');
            setDevices(videoDevices);

            if (videoDevices.length > 0) {
                const backCamera = videoDevices.find((device) =>
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('environment') ||
                    device.label.toLowerCase().includes('rear') ||
                    device.label.toLowerCase().includes('facing')
                );
                if (!selectedDeviceId) {
                    setSelectedDeviceId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
                }
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            setIsWarningOpen(true);
        }
    };

    const attachStream = async () => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: selectedDeviceId ? {
                        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                        width: { ideal: 800 },
                        height: { ideal: 600 },
                        facingMode: selectedDeviceId ? undefined : "environment",
                    } : true,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true");
                    videoRef.current.setAttribute("muted", "true");
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                    };
                }
            } else {
                console.error("Media devices not supported");
                setIsWarningOpen(true);
            }
        } catch (error) {
            console.error("Error starting camera:", error);
            setIsWarningOpen(true);
        }
    };

    const startCamera = async () => {
        await initDevices();
        await attachStream();
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => {
                track.stop();
                console.log(`Track ${track.kind} stopped`);
            });
            videoRef.current.srcObject = null;
            console.log('Camera stopped');
        }
    };

    const takeSnapshot = (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (canvasRef.current && videoRef.current) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    context.drawImage(
                        videoRef.current,
                        0,
                        0,
                        canvasRef.current.width,
                        canvasRef.current.height,
                    );
                    canvasRef.current.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/png');
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    };

    const handleSettingsClick = () => {
        setIsSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setIsSettingsOpen(false);
    };

    const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        setSelectedDeviceId(deviceId);
        localStorage.setItem('selectedDeviceId', deviceId);
    };

    const handleWarningClose = () => {
        setIsWarningOpen(false);
        initDevices();
    };

    useEffect(() => {
        if (selectedDeviceId) {
            stopCamera();
            startCamera().then(() => {
                attachStream();
            });
        }
    }, [selectedDeviceId]);

    const SettingsModal = () => (
        <Modal isOpen={isSettingsOpen} onClose={handleSettingsClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('use_camera.select_camera')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Select onChange={handleDeviceChange} value={selectedDeviceId || ''}>
                        {devices.map(device => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label}
                            </option>
                        ))}
                    </Select>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={handleSettingsClose}>{t('use_camera.close')}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    const WarningModal = () => (
        <Modal isOpen={isWarningOpen} onClose={handleWarningClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{t('use_camera.camera_access_required')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Alert status="warning">
                        <AlertIcon />
                        <AlertTitle mr={2}>{t('use_camera.camera_access_denied')}</AlertTitle>
                        <AlertDescription>{t('use_camera.allow_camera_access')}</AlertDescription>
                    </Alert>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={handleWarningClose}>{t('use_camera.try_again')}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return {
        videoRef,
        canvasRef,
        startCamera,
        stopCamera,
        takeSnapshot,
        devices,
        selectedDeviceId,
        setSelectedDeviceId,
        handleSettingsClick,
        SettingsModal,
        WarningModal,
    };
};

export default useCamera;
