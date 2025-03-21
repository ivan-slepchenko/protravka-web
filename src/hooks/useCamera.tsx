import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Select, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const useCamera = () => {
    const { t } = useTranslation();

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
    const [cameraStarted, setCameraStarted] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null); // State to store the MediaStream
    const constraints = { video: { facingMode: "environment" } };
    const cameraTimeout = useRef<any | null>(null);

    const getVideoDevices = useCallback(async () => {
        await navigator.mediaDevices.getUserMedia(constraints);
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === "videoinput");
    }, []);

    const startCamera = useCallback(async (attempt = 1) => {
        if (videoRef.current) {
            console.log('Video element ready, starting camera...');
            let selectedDeviceId = localStorage.getItem('selectedDeviceId');
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
                console.info('Starting camera, camera permission:', permissionStatus.state);
                if (permissionStatus.state === 'denied') {
                    console.error('Camera permission denied');
                    setIsWarningOpen(true);
                    return;
                }

                const videoDevices = await getVideoDevices();
                const defaultDevice = videoDevices.find(device => /rear|back|environment|facing/i.test(device.label));

                console.info('Video devices:', videoDevices);
                if (!selectedDeviceId) {
                    selectedDeviceId = defaultDevice ? defaultDevice.deviceId : videoDevices[0]?.deviceId;
                }
                console.info('Selected video device:', selectedDeviceId);

                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                        width: { ideal: 800 },
                        height: { ideal: 600 },
                        facingMode: selectedDeviceId ? undefined : "environment",
                    }
                });

                console.info('Camera stream retrieved successfully');
                setStream(newStream); // Store the stream in state
                
                videoRef.current.srcObject = newStream;
                videoRef.current.muted = true;
                // videoRef.current.playsInline = true;
                
                videoRef.current.srcObject = newStream;

                videoRef.current.onloadedmetadata = (e) => {
                    console.log('Camera metadata loaded:', e);
                };

                console.log('video.srcObject', videoRef.current.srcObject);
                console.log('video.readyState', videoRef.current.readyState);

                
                await videoRef.current.play();
                
                console.log('video.srcObject', videoRef.current.srcObject);
                console.log('video.readyState', videoRef.current.readyState);

                videoRef.current.onerror = (error) => {
                    console.error('Error loading camera metadata:', error);
                    setIsWarningOpen(true);
                };

            } catch (error) {
                if (attempt < 3) {
                    console.log(`Retrying camera start (Attempt ${attempt})...`);
                    setTimeout(() => startCamera(attempt + 1), 1000);
                    return;
                }
                console.error("Error starting camera:", error);
                setIsWarningOpen(true);
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
    }, [getVideoDevices]);

    const stopCamera = useCallback(() => {
        console.log('Stop camera called');
        if (cameraTimeout.current) {
            console.log('Clearing camera timeout...');
            clearTimeout(cameraTimeout.current);
            cameraTimeout.current = null;
        }
        if (stream) {
            console.log('Stopping camera tracks...');
            stream.getTracks().forEach((track) => {
                track.stop();
                console.log(`Track ${track.kind} stopped`);
            });
            setStream(null); // Cleanup the stream from state
            console.log('Camera stream removed');
        }

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
            console.log('video.srcObject set to null');
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            console.log('Video element cleaned up');
        }

        setCameraStarted(false);
        console.log('Camera stopped, cameraStarted set to false');
    }, [stream]);

    const takeSnapshot = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (videoRef.current) {
                const video = videoRef.current;

                // Create a new canvas element dynamically
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth; // Match canvas width to video width
                canvas.height = video.videoHeight; // Match canvas height to video height

                const context = canvas.getContext('2d');
                if (context) {
                    // Draw the entire video frame onto the canvas
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert the canvas content to a Blob
                    canvas.toBlob((blob) => {
                        resolve(blob);

                        // Cleanup: Remove the canvas from memory
                        canvas.remove();
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

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.hidden) {
                stopCamera();
                console.log('Camera stopped due to visibility change');
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [stopCamera]);

    return {
        videoRef,
        canvasRef,
        startCamera,
        stopCamera,
        takeSnapshot,
        handleSettingsClick,
        SettingsModal,
        WarningModal,
    };
};

export default useCamera;
