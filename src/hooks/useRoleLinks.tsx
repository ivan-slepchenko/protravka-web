import React from 'react';
import { Role } from '../operators/Operators';
import { FiTrello } from 'react-icons/fi';
import { TbReportAnalytics } from "react-icons/tb";
import { AtSignIcon, AddIcon } from '@chakra-ui/icons';
import { BiSolidComponent } from "react-icons/bi";
import { FaSeedling, FaTasks, FaFlask } from "react-icons/fa";

const roleToLinks = {
    [Role.MANAGER]: [
        { to: "/board", label: "Board", icon: <FiTrello /> },
        { to: "/new", label: "New Receipe", icon: <AddIcon /> },
        { to: "/report", label: "Report", icon: <TbReportAnalytics /> },
    ],
    [Role.ADMIN]: [
        { to: "/operators", label: "Operators", icon: <AtSignIcon /> },
        { to: "/crops", label: "Crops", icon: <FaSeedling /> },
        { to: "/products", label: "Products", icon: <BiSolidComponent /> },
    ],
    [Role.OPERATOR]: [
        { to: "/execution", label: "Execution", icon: <FaTasks /> },
    ],
    [Role.LABORATORY]: [
        { to: "/lab", label: "Lab", icon: <FaFlask /> },
    ],
};

const useRoleLinks = (roles: Role[]) => {
    const userRoles = roles || [];
    const managerLinks = userRoles.includes(Role.MANAGER) ? roleToLinks[Role.MANAGER] : [];
    const adminLinks = userRoles.includes(Role.ADMIN) ? roleToLinks[Role.ADMIN] : [];
    const operatorLinks = userRoles.includes(Role.OPERATOR) ? roleToLinks[Role.OPERATOR] : [];
    const laboratoryLinks = userRoles.includes(Role.LABORATORY) ? roleToLinks[Role.LABORATORY] : [];

    return { managerLinks, adminLinks, operatorLinks, laboratoryLinks };
};

export default useRoleLinks;
