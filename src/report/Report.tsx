import React from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReportTab from "../board/orderInfo/report/ReportTab";
import { AppDispatch, RootState } from "../store/store";
import { fetchOrderExecution } from "../store/executionSlice";

const Report: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const order = useSelector((state: RootState) => state.orders.activeOrders.find(order => order.id === orderId));
    const orderExecution = useSelector((state: RootState) => state.execution.orderExecutions.find(execution => execution.orderId === orderId));

    React.useEffect(() => {
        if (orderId !== undefined) {
            dispatch(fetchOrderExecution(orderId));
        }
    }, [dispatch, orderId]);

    if (!order) return null;

    const handleClose = () => {
        navigate('/board');
    };

    return (
        <Box w="full" h="full" overflowY="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" p="4" borderBottom="1px solid #ccc">
                <Text fontSize="2xl" fontWeight="bold">Report</Text>
                <Button onClick={handleClose}>Close</Button>
            </Box>
            <Box p="4">
                <ReportTab/>
            </Box>
        </Box>
    );
};

export default Report;
