import { useRef, useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Select, Button } from '@chakra-ui/react';

const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

    const getDevices = async () => {
        const constraints = {
            video: { facingMode: "user" }
        };
        await navigator.mediaDevices.getUserMedia(constraints);
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Devices', JSON.stringify(devices));
        const videoDevices = devices;
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
    };

    const startCamera = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({
                    video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
                })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current?.play();
                        };
                    }
                });
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

    useEffect(() => {
        getDevices();
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
    };
};

export default useCamera;
