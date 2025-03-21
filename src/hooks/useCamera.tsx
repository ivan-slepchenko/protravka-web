import React, { useRef, useEffect, useState, useCallback, MutableRefObject } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Select, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const useCamera = () => {
    const { t } = useTranslation();

    const videoPlaceholderRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
    const [cameraStarted, setCameraStarted] = useState<boolean>(false);
    const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false); // New state
    const [stream, setStream] = useState<MediaStream | null>(null); // State to store the MediaStream
    const constraints = { video: { facingMode: "environment" } };
    const cameraTimeout = useRef<any | null>(null);

    const getVideoDevices = useCallback(async () => {
        await navigator.mediaDevices.getUserMedia(constraints);
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === "videoinput");
    }, []);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = useCallback(async (attempt = 1) => {
        if (isCameraStarting) {
            alert('Camera is already starting. Please wait.');
            return;
        }

        setIsCameraStarting(true); // Set the flag to true
        if (videoPlaceholderRef.current) {
            console.log('Video placeholder ready, starting camera...');
            let selectedDeviceId = localStorage.getItem('selectedDeviceId');
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
                console.info('Starting camera, camera permission:', permissionStatus.state);
                if (permissionStatus.state === 'denied') {
                    console.error('Camera permission denied');
                    setIsWarningOpen(true);
                    setIsCameraStarting(false); // Reset the flag
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

                // Clear all children of the placeholder and create a new video element
                videoPlaceholderRef.current.innerHTML = '';
                const newVideo = document.createElement('video');
                newVideo.style.width = '100%';
                newVideo.style.height = '100%';
                newVideo.style.objectFit = 'cover';
                newVideo.style.display = 'block';
                newVideo.setAttribute('autoplay', 'true');
                newVideo.setAttribute('muted', 'true');
                newVideo.setAttribute('playsinline', 'true');
                videoPlaceholderRef.current.appendChild(newVideo);

                newVideo.srcObject = newStream;
                newVideo.onloadedmetadata = async (e) => {
                    console.log('Camera metadata loaded:', e);
                    try {
                        await newVideo.play();
                    } catch (error) {
                        console.error('Error playing camera:', error);
                        setIsWarningOpen(true);
                    }
                };

                console.log('video.srcObject', newVideo.srcObject);
                console.log('video.readyState', newVideo.readyState);

                

                console.log('video.srcObject', newVideo.srcObject);
                console.log('video.readyState', newVideo.readyState);

                newVideo.onerror = (error) => {
                    console.error('Error loading camera metadata:', error);
                    setIsWarningOpen(true);
                };

            } catch (error) {
                console.error('Error starting camera:', error);
                if (attempt < 3) {
                    console.log(`Retrying camera start (Attempt ${attempt})...`);
                    setTimeout(() => startCamera(attempt + 1), 1000);
                    setIsCameraStarting(false); // Reset the flag
                    return;
                }
                console.error("Error starting camera:", error);
                setIsWarningOpen(true);
                setIsCameraStarting(false); // Reset the flag
                return;
            }
            setCameraStarted(true);
        } else {
            console.warn('Video placeholder not ready, retrying...');
            if (cameraTimeout.current) {
                clearTimeout(cameraTimeout.current);
            }
            cameraTimeout.current = setTimeout(startCamera, 100);
        }
        setIsCameraStarting(false); // Reset the flag
    }, [getVideoDevices, isCameraStarting]);

    const stopCamera = useCallback(() => {
        console.log('Stop camera called');
        
        if (cameraTimeout.current) {
            console.log('Clearing camera timeout...');
            clearTimeout(cameraTimeout.current);
            cameraTimeout.current = null;
        }

        if (videoPlaceholderRef.current) {
            const video = videoPlaceholderRef.current.firstChild as HTMLVideoElement;

            // Clear all children of the placeholder
            videoPlaceholderRef.current.innerHTML = '';
            console.log('Video element removed from placeholder');

            video.srcObject = null;
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

        setCameraStarted(false);

        navigator.mediaDevices.getUserMedia({ video: false });
        
        console.log('Camera stopped, cameraStarted set to false');
    }, [stream]);

    const takeSnapshot = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (videoPlaceholderRef.current && stream) {
                const video = videoPlaceholderRef.current.firstChild as HTMLVideoElement;

                if (!video) {
                    console.error('No video element found in videoPlaceholderRef');
                    resolve(null);
                    return;
                }

                // Get video track settings for width and height
                const videoTrack = stream.getVideoTracks()[0];
                const { width, height } = videoTrack.getSettings();

                // Create a new canvas element dynamically
                const canvas = document.createElement('canvas');
                canvas.width = width || video.videoWidth; // Use stream width or fallback to video width
                canvas.height = height || video.videoHeight; // Use stream height or fallback to video height

                const context = canvas.getContext('2d');
                if (context) {
                    // Draw the entire video frame onto the canvas
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert the canvas content to a Blob
                    canvas.toBlob((blob) => {
                        resolve(blob);

                        // Cleanup: Remove the canvas from memory
                        canvas.remove();
                        stopCamera();
                    }, 'image/png');
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    }, [stream]);

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
        videoPlaceholderRef,
        startCamera,
        stopCamera,
        takeSnapshot,
        handleSettingsClick,
        SettingsModal,
        WarningModal,
    };
};

export default useCamera;
