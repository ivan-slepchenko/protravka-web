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
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]); // State to store the video devices
    const cameraTimeout = useRef<any | null>(null);

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
                
                if (!selectedDeviceId) {
                    console.log('No selected device found is set, getting video devices...');

                    const stream = await navigator.mediaDevices.getUserMedia(
                        { video: true }
                    );
                    stream.getTracks().forEach(track => {
                        track.enabled = false;
                        track.stop();
                        stream.removeTrack(track);
                    });
                    
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    
                    const videoDevices = devices.filter(device => device.kind === "videoinput");
                    setDevices(videoDevices);

                    const defaultDevice = videoDevices.find(device => /rear|back|environment/i.test(device.label));
                    console.info('Video devices:', JSON.stringify(videoDevices));
                    selectedDeviceId = defaultDevice ? defaultDevice.deviceId : videoDevices[0]?.deviceId;

                    localStorage.setItem('selectedDeviceId', selectedDeviceId || '');
                    
                }
                console.info('Selected video device:', selectedDeviceId);

                if (!selectedDeviceId) {
                    console.error('No video devices found');
                    setIsWarningOpen(true);
                    setIsCameraStarting(false); // Reset the flag
                    return;
                }

                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                        width: { ideal: 800 },
                        height: { ideal: 600 },
                        facingMode: selectedDeviceId ? undefined : "environment",
                    }
                });     
                

                const streamEvents = ['addtrack', 'removetrack'];
                streamEvents.forEach((eventName) => {
                    newStream.addEventListener(eventName, (event) => {
                        console.log(`[Stream] Event: ${eventName}`, event);
                    });
                });

                // 🔍 Events on individual tracks
                newStream.getTracks().forEach((track) => {
                    const trackEvents = ['ended', 'mute', 'unmute', 'overconstrained'];

                    console.log(`[Track] Kind: ${track.kind}, ID: ${track.id}`);

                    trackEvents.forEach((eventName) => {
                        track.addEventListener(eventName, (event) => {
                            console.log(`[Track: ${track.kind}] Event: ${eventName}`, event);
                        });
                    });

                    // Optional: log track settings and constraints
                    console.log(`[Track: ${track.kind}] Settings:`, track.getSettings());
                    console.log(`[Track: ${track.kind}] Constraints:`, track.getConstraints());
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
                newVideo.autoplay = true;
                newVideo.muted = true;
                newVideo.playsInline = true;
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

                newVideo.onloadeddata = (e) => {
                    console.log('Camera loaded data:', e);
                };

                newVideo.onplaying = (e) => {
                    console.log('Camera playing:', e);
                };  

                newVideo.oncanplay = (e) => {
                    console.log('Camera can play:', e);
                };

                newVideo.oncanplaythrough = (e) => {
                    console.log('Camera can play through:', e);
                }

                newVideo.onerror = (error) => {
                    console.error('Error loading camera metadata:', error);
                    setIsWarningOpen(true);
                };

                try {
                    await newVideo.play();
                    console.log('Video playing');
                } catch (error) {
                    console.error('Error playing video:', error);
                    setIsWarningOpen(true);
                }

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
    }, [isCameraStarting]);

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
                track.enabled = false;
                stream.removeTrack(track);
                console.log(`Track ${track.kind} stopped and removed`);
            });
            
            setStream(null); // Cleanup the stream from state
            console.log('Camera stream removed');
        }

        setCameraStarted(false);

        navigator.mediaDevices.getUserMedia({  video: { facingMode: { ideal: "user" } } });
        
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
        const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

        const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
            const newDeviceId = e.target.value;
            localStorage.setItem('selectedDeviceId', newDeviceId);
            setSelectedDeviceId(newDeviceId);
            if (cameraStarted) {
                stopCamera();
                startCamera();
            }
        };

        useEffect(() => {
            const handleVisibilityChange = async () => {
                console.log('Visibility change:', document.hidden);
                if (document.hidden) {
                    stopCamera();
                    console.log('Camera stopped due to visibility change');
                }
            };

            const handleBeforeUnload = () => {
                console.log('Before unload event');
                stopCamera();
            };

            document.addEventListener("visibilitychange", handleVisibilityChange);

            window.addEventListener("beforeunload", handleBeforeUnload);

            return () => {
                document.removeEventListener("visibilitychange", handleVisibilityChange);
                window.removeEventListener("beforeunload", () => {
                    console.log('Before unload event');
                    stopCamera();
                });
            };

        }, [stopCamera]);
         
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
