import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, Select } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Info: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [version, setVersion] = useState<string>('');
    const availableLanguages = useSelector((state: RootState) => state.user.company?.availableLanguages || []);

    useEffect(() => {
        const getAppVersion = async () => {
            const packageJson = await import('../../package.json');
            setVersion(packageJson.default.version);
        };

        getAppVersion();
    }, []);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        i18n.changeLanguage(selectedLanguage);
        localStorage.setItem('selectedLanguage', selectedLanguage);
    };

    useEffect(() => {
        const storedLanguage = localStorage.getItem('selectedLanguage');
        if (storedLanguage && availableLanguages.includes(storedLanguage)) {
            i18n.changeLanguage(storedLanguage);
        }
    }, [availableLanguages, i18n]);

    return (
        <VStack align="start" p={4} h="full">
            <Box>
                <Text fontSize="lg" fontWeight="bold">{t('info.app_version')}:</Text>
                <Text>{version}</Text>
            </Box>
            <Box>
                <Text fontSize="lg" fontWeight="bold">{t('info.language')}:</Text>
                <Select onChange={handleLanguageChange} value={i18n.language}>
                    {availableLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                            {lang}
                        </option>
                    ))}
                </Select>
            </Box>
        </VStack>
    );
};

export default Info;
