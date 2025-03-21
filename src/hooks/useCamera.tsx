import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Select, Button, Alert, AlertIcon, AlertTitle, AlertDescription, Spinner, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const useCamera = () => {
    const { t } = useTranslation();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
    const [cameraStarted, setCameraStarted] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false); // State for progress bar
    const constraints = { video: { facingMode: "environment" } };
    const cameraTimeout = useRef<any | null>(null);

    const getVideoDevices = useCallback(async () => {
        await navigator.mediaDevices.getUserMedia(constraints);
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === "videoinput");
    }, []);


    const startCamera = useCallback(async () => {
        if (videoRef.current) {
            console.log('Video element ready, starting camera...');
            let selectedDeviceId = localStorage.getItem('selectedDeviceId');
            setIsLoading(true); // Show progress bar
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
                console.info('Starting camera, camera permission:', permissionStatus.state);
                if (permissionStatus.state === 'denied') {
                    console.error('Camera permission denied');
                    setIsWarningOpen(true);
                    setIsLoading(false); // Hide progress bar
                    return;
                }

                const videoDevices = await getVideoDevices();
                const defaultDevice = videoDevices.find(device => /rear|back|environment|facing/i.test(device.label));
            
                console.info('Video devices:', videoDevices);
                if (!selectedDeviceId) {
                    selectedDeviceId = defaultDevice ? defaultDevice.deviceId : videoDevices[0]?.deviceId;
                }
                console.info('Selected video device:', selectedDeviceId);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                        width: { ideal: 800 },
                        height: { ideal: 600 },
                        facingMode: selectedDeviceId ? undefined : "environment",
                    }
                });

                console.info('Camera stream retrieved successfully');

                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsInline", "true");
                videoRef.current.setAttribute("muted", "true");

                // Fallback: Handle metadata loading errors
                videoRef.current.onloadedmetadata = async () => {
                    // Attempt to play immediately
                    try {
                        if (videoRef.current) {
                            // videoRef.current.play();
                            console.info('Camera playback started successfully');
                        } else {
                            console.error('Video element not ready');
                            setIsWarningOpen(true);
                            setIsLoading(false); // Hide progress bar
                        }
                        setIsLoading(false); // Hide progress bar
                    } catch (playError) {
                        console.error('Error starting camera playback immediately:', playError);
                        setIsWarningOpen(true);
                        setIsLoading(false); // Hide progress bar
                    }
                    console.info('Camera metadata loaded successfully');
                };

                videoRef.current.onerror = (error) => {
                    console.error('Error loading camera metadata:', error);
                    setIsWarningOpen(true);
                    setIsLoading(false); // Hide progress bar
                };

            } catch (error) {
                console.error("Error starting camera:", error);
                setIsWarningOpen(true);
                setIsLoading(false); // Hide progress bar
                return;
            }
            setCameraStarted(true);
        } else {
            console.warn('Video element not ready, retrying...');
            if (cameraTimeout.current) {
                clearTimeout(cameraTimeout.current);
            }
            cameraTimeout.current = setTimeout(startCamera, 100);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (cameraTimeout.current) {
            clearTimeout(cameraTimeout.current);
            cameraTimeout.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => {
                track.stop();
                console.log(`Track ${track.kind} stopped`);
            });
            videoRef.current.srcObject = null;
            console.log('Camera stopped');
        }
        setCameraStarted(false);
    }, []);

    const takeSnapshot = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (canvasRef.current && videoRef.current) {
                const context = canvasRef.current.getContext('2d');
                if (context) {
                    // Reset or clear any transforms before drawing
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const videoAspectRatio = video.videoWidth / video.videoHeight;
                    const canvasAspectRatio = canvas.width / canvas.height;
                    let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;

                    if (videoAspectRatio > canvasAspectRatio) {
                        sWidth = video.videoHeight * canvasAspectRatio;
                        sx = (video.videoWidth - sWidth) / 2;
                    } else {
                        sHeight = video.videoWidth / canvasAspectRatio;
                        sy = (video.videoHeight - sHeight) / 2;
                    }

                    // Draw the cropped area
                    context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                    window.alert(`sx: ${sx}, sy: ${sy}, sWidth: ${sWidth}, sHeight: ${sHeight}, videoAspectRatio: ${videoAspectRatio}, canvasAspectRatio: ${canvasAspectRatio}, canvasWidth: ${canvas.width}, canvasHeight: ${canvas.height}, videoWidth: ${video.videoWidth}, videoHeight: ${video.videoHeight}, videoClientWidth: ${video.clientWidth}, videoClientHeight: ${video.clientHeight}`);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/png');
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }, []);

    const handleSettingsClick = () => {
        setIsSettingsOpen(true);
    };

    const handleWarningClose = () => {
        setIsWarningOpen(false);
        stopCamera();
        startCamera();
    };

    const SettingsModal = useCallback(() => {
        const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
        const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

        useEffect(() => {
            if (!isSettingsOpen) return;
            const getDevices = async () => {
                await navigator.mediaDevices.getUserMedia(constraints);
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter((device) => device.kind === 'videoinput');
                setDevices(videoDevices);
                const storedDeviceId = localStorage.getItem('selectedDeviceId');
                if (storedDeviceId) {
                    setSelectedDeviceId(storedDeviceId);
                }
            };
            getDevices();
        }, [isSettingsOpen]);

        const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newDeviceId = e.target.value;
            localStorage.setItem('selectedDeviceId', newDeviceId);
            setSelectedDeviceId(newDeviceId);
            if (cameraStarted) {
                stopCamera();
                startCamera();
            }
        };
         
        return (
            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{t('use_camera.select_camera')}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select value={selectedDeviceId} onChange={handleDeviceChange}>
                            {devices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label}
                                </option>
                            ))}
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setIsSettingsOpen(false)}>{t('use_camera.close')}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }, [isSettingsOpen]);

    const WarningModal = useCallback(() => (
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
    ), [isWarningOpen]);

    const CameraLoader = useCallback(() => (
        isLoading ? (
            <Center position="absolute" top="0" left="0" width="100%" height="100%" bg="rgba(0, 0, 0, 0.5)" zIndex="10">
                <Spinner size="xl" color="white" />
            </Center>
        ) : null
    ), [isLoading]);

    return {
        videoRef,
        canvasRef,
        startCamera,
        stopCamera,
        takeSnapshot,
        handleSettingsClick,
        SettingsModal,
        WarningModal,
        CameraLoader,
    };
};

export default useCamera;
