import { useRef, useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Select, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);

    const getDevices = async () => {
        try {
            // Check if camera permission is denied before even requesting
            const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            if (permissionStatus.state === 'denied') {
                setIsWarningOpen(true);
                return;
            }

            // Try to request permission and enumerate devices
            const constraints = { video: { facingMode: "user" } };
            await navigator.mediaDevices.getUserMedia(constraints);
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === 'videoinput');
            setDevices(videoDevices);

            if (videoDevices.length > 0) {
                const frontCamera = videoDevices.find((device) =>
                    device.label.toLowerCase().includes('front') || 
                    device.label.toLowerCase().includes('user') ||
                    device.label.toLowerCase().includes('selfie') ||
                    device.label.toLowerCase().includes('facing')
                );
                setSelectedDeviceId(frontCamera ? frontCamera.deviceId : videoDevices[0].deviceId);
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            setIsWarningOpen(true);
        }
    };

    const startCamera = async () => {
        try {
            await getDevices();
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices
                    .getUserMedia({
                        video: selectedDeviceId ? {
                            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                            width: { ideal: 1280 }, // Enforce resolution to prevent fullscreen mode
                            height: { ideal: 720 },
                            facingMode: selectedDeviceId ? undefined : "user",
                        } : true,
                    })
                    .then((stream) => {
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            videoRef.current.setAttribute("playsinline", "true"); // Important for iOS!
                            videoRef.current.setAttribute("muted", "true"); // Avoids issues on iOS
                            videoRef.current.onloadedmetadata = () => {
                                videoRef.current?.play();
                            };
                        }
                    })
                    .catch((error) => {
                        console.error("Camera access denied:", error);
                        setIsWarningOpen(true);
                    });
            } else {
                console.error("Media devices not supported");
                setIsWarningOpen(true);
            }
        } catch (error) {
            console.error("Error starting camera:", error);
            setIsWarningOpen(true);
        }
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

    const takeSnapshot = () => {
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
                return canvasRef.current.toDataURL('image/png');
            }
        }
        return null;
    };

    const handleSettingsClick = () => {
        setIsSettingsOpen(true);
    };

    const handleSettingsClose = () => {
        setIsSettingsOpen(false);
    };

    const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDeviceId(e.target.value);
    };

    const handleWarningClose = () => {
        setIsWarningOpen(false);
        getDevices();
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    useEffect(() => {
        if (selectedDeviceId) {
            stopCamera();
            startCamera();
        }
    }, [selectedDeviceId]);

    const SettingsModal = () => (
        <Modal isOpen={isSettingsOpen} onClose={handleSettingsClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Select Camera</ModalHeader>
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
                    <Button onClick={handleSettingsClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    const WarningModal = () => (
        <Modal isOpen={isWarningOpen} onClose={handleWarningClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Camera Access Required</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Alert status="warning">
                        <AlertIcon />
                        <AlertTitle mr={2}>Camera access denied!</AlertTitle>
                        <AlertDescription>Please allow camera access to proceed.</AlertDescription>
                    </Alert>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={handleWarningClose}>Try Again</Button>
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
