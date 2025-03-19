import { Box, Flex, Heading, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MotionBox = motion(Box);

export const PwaInstallGuide = () => {
    // const isMobile = useBreakpointValue({ base: true, md: false });
    const { t } = useTranslation();

    const desktopImg =
        'https://cdn.glitch.global/d1f998ee-65d2-440a-841f-89c67e5cc4e1/pwa-desktop.png?v=1664923691451';
    const mobileImg =
        'https://web.dev/static/articles/installing-pwas/pwa-android-install-c16055c8a91fbc93aa233d1db949ffcb.png';

    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            minHeight="100vh"
            p={{ base: 4, md: 10 }}
            bgGradient="linear(to-r, teal.200, teal.500)"
            color="white"
        >
            <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                maxW={useBreakpointValue({ base: '90%', md: '600px' })}
                textAlign="center"
            >
                <Heading fontSize={{ base: '2xl', md: '3xl' }} mb={4}>
                    How to Install Our App
                </Heading>
                <Text fontSize={{ base: 'md', md: 'lg' }} mb={4}>
                    Install this app on your device for a better experience and easy access.
                </Text>
                <Flex direction={useBreakpointValue({ base: 'column', md: 'row' })} gap={6} align="center">
                    <Box>
                        <Image
                            src={useBreakpointValue({ base: mobileImg, md: desktopImg })}
                            alt={t("pwa_install_guide.how_to_install_pwa")}
                            borderRadius="lg"
                            boxShadow="xl"
                            mb={{ base: 4, md: 0 }}
                        />
                    </Box>
                    <Box>
                        {useBreakpointValue({
                            base: (
                                <Text>
                                    Tap the browser menu and select{' '}
                                    <strong>{'"Add to Home screen"'}</strong>.
                                </Text>
                            ),
                            md: (
                                <Text>
                                    Click the install button <strong>(+)</strong> in the address bar of your browser.
                                </Text>
                            ),
                        })}
                    </Box>
                </Flex>
            </MotionBox>
        </Flex>
    );
};
