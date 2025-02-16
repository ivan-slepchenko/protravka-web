import React from 'react';
import { Role } from '../operators/Operators';
import { FiTrello } from 'react-icons/fi';
import { TbReportAnalytics } from "react-icons/tb";
import { AtSignIcon, AddIcon } from '@chakra-ui/icons';
import { BiSolidComponent } from "react-icons/bi";
import { FaSeedling, FaTasks, FaFlask } from "react-icons/fa";
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTranslation } from 'react-i18next';

const useRoleLinks = (roles: Role[]) => {
    const { t } = useTranslation();
    const user = useSelector((state: RootState) => state.user);
    const useLab = user.company?.featureFlags.useLab;

    const roleToLinks = {
        [Role.MANAGER]: [
            { to: "/board", label: t('use_role_links.board'), icon: <FiTrello /> },
            { to: "/new", label: useLab ? t('use_role_links.new_assignment') : t('use_role_links.new_recipe'), icon: <AddIcon /> },
            { to: "/report", label: t('use_role_links.report'), icon: <TbReportAnalytics /> },
        ],
        [Role.ADMIN]: [
            { to: "/operators", label: t('use_role_links.operators'), icon: <AtSignIcon /> },
            { to: "/crops", label: t('use_role_links.crops'), icon: <FaSeedling /> },
            { to: "/products", label: t('use_role_links.products'), icon: <BiSolidComponent /> },
        ],
        [Role.OPERATOR]: [
            { to: "/execution", label: t('use_role_links.execution'), icon: <FaTasks /> },
        ],
        [Role.LABORATORY]: [
            { to: "/lab", label: t('use_role_links.lab'), icon: <FaFlask /> },
        ],
    };

    const userRoles = roles || [];
    const managerLinks = userRoles.includes(Role.MANAGER) ? roleToLinks[Role.MANAGER] : [];
    const adminLinks = userRoles.includes(Role.ADMIN) ? roleToLinks[Role.ADMIN] : [];
    const operatorLinks = userRoles.includes(Role.OPERATOR) ? roleToLinks[Role.OPERATOR] : [];
    const laboratoryLinks = userRoles.includes(Role.LABORATORY) ? roleToLinks[Role.LABORATORY] : [];

    return { managerLinks, adminLinks, operatorLinks, laboratoryLinks };
};

export default useRoleLinks;
