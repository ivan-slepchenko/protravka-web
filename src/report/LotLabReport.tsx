import React, { useEffect, useState } from "react";
import { Box, Center, Text, Progress, Table, Thead, Tbody, Tr, Th, Td, HStack, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { fetchOrderExecution, fetchTkwMeasurementsByExecutionId, TkwMeasurement } from "../store/executionSlice";
import { Scatter } from 'react-chartjs-2';
import type { ChartOptions, Plugin } from 'chart.js';
import { Chart, registerables } from 'chart.js/auto';
import { useTranslation } from 'react-i18next';
import 'chartjs-adapter-moment';

Chart.register(...registerables);

const LotLabReport: React.FC = () => {
    const { t } = useTranslation();
    const { orderId } = useParams<{ orderId: string }>();
    const [tkwMeasurements, setTkwMeasurements] = useState<TkwMeasurement[]>([]);

    useEffect(() => {
        if (orderId) {
            fetchOrderExecution(orderId).then((orderExecution) => {
                if (orderExecution?.id) {
                    fetchTkwMeasurementsByExecutionId(orderExecution.id)
                        .then(data => setTkwMeasurements(data))
                        .catch(error => console.error('Failed to fetch TKW measurements:', error));
                }
            });
        }
    }, [orderId]);

    const tkwData = tkwMeasurements.filter((measurement) => measurement.probeDate !== undefined).flatMap((measurement) => [
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe1 },
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe2 },
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe3 },
    ].filter(point => point.y !== undefined)) || [];

    console.log('tkwData:', tkwData);

    const averageTkw = tkwMeasurements.length > 0 ? tkwMeasurements.reduce((sum, measurement) => {
        const total = (measurement.tkwProbe1 || 0) + (measurement.tkwProbe2 || 0) + (measurement.tkwProbe3 || 0);
        return sum + total / 3;
    }, 0) / tkwMeasurements.length : 0;

    const chartData = {
        datasets: [
            {
                label: t('lot_report.tkw_measurements'),
                data: tkwData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 5,
            },
        ],
    };

    console.log('Render average TKW:', averageTkw);

    const deviationLinesPlugin: Plugin = {
        id: "deviationLines",
        beforeDatasetsDraw: (chart) => {
            const { ctx, scales: { x, y } } = chart;
            ctx.save();
            
            const xStartCoord = x.left;
            const xEndCoord = x.right;

            const drawLine = (yValue: number, color: string, dash: number[]) => {
                const yCoord = y.getPixelForValue(yValue);
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.setLineDash(dash);
                ctx.moveTo(xStartCoord, yCoord);
                ctx.lineTo(xEndCoord, yCoord);
                ctx.stroke();
            };

            drawLine(averageTkw * 1.05, 'orange', [5, 5]);
            drawLine(averageTkw * 0.95, 'orange', [5, 5]);
            drawLine(averageTkw * 1.10, 'red', []);
            drawLine(averageTkw * 0.90, 'red', []);
        }
    }; 
    
    const options: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: t('lot_report.date'),
                },
                grid: {
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: true,
                    lineWidth: 1,
                    color: 'rgba(0, 0, 0, 0.1)',
                    
                },
                ticks: {
                    callback: function(value: any) {
                        return new Date(value).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                    },
                    stepSize: 60 * 60 * 1000,
                    autoSkip: false
                },
                min: tkwData.length > 0 ? Math.min(...tkwData.map(d => d.x)) - 2 * 60 * 60 * 1000 : new Date().getTime() - 86400000, // 2 hours before first data point or 1 day before now
                max: tkwData.length > 0 ? Math.max(...tkwData.map(d => d.x)) + 2 * 60 * 60 * 1000 : new Date().getTime() + 86400000, // 2 hours after last data point or 1 day after now
            },
            y: {
                title: {
                    display: true,   
                    text: t('lot_report.tkw_value'),
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.raw.y;
                        const date = new Date(context.raw.x).toLocaleString();
                        return `${value} gr.\n${date}`;
                    }
                }
            }
        }
    };

    return (
        <VStack w="full" height="auto" p={8} position="relative">
            {tkwMeasurements.length > 0 ? (
                <>
                    <HStack w="full" spacing={4} mb={8} justifyContent="space-between" alignItems={"flex-start"}>
                        <Table variant="simple" size="sm" w="48%">
                            <Thead bg="orange.100">
                                <Tr>
                                    <Th bg="yellow.300" color="black" textAlign="center">Category</Th>
                                    <Th bg="yellow.300" color="black" textAlign="center">Upper Limit</Th>
                                    <Th bg="yellow.300" color="black" textAlign="center">Lower Limit</Th>
                                    <Th bg="yellow.300" color="black" textAlign="center">Samples</Th>
                                    <Th bg="yellow.300" color="black" textAlign="center">%</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td bg="green.300" color="black" textAlign="center">OK</Td>
                                    <Td bg="green.300" color="black" textAlign="center">105</Td>
                                    <Td bg="green.300" color="black" textAlign="center">90</Td>
                                    <Td bg="green.300" color="black" textAlign="center">8</Td>
                                    <Td bg="green.300" color="black" textAlign="center">36%</Td>
                                </Tr>
                                <Tr>
                                    <Td bg="yellow.300" color="black" textAlign="center">Monitoring</Td>
                                    <Td bg="yellow.300" color="black" textAlign="center">115</Td>
                                    <Td bg="yellow.300" color="black" textAlign="center">80</Td>
                                    <Td bg="yellow.300" color="black" textAlign="center">11</Td>
                                    <Td bg="yellow.300" color="black" textAlign="center">50%</Td>
                                </Tr>
                                <Tr>
                                    <Td bg="red.500" color="white" textAlign="center">Quick Improvement Needed</Td>
                                    <Td bg="red.500" color="white" textAlign="center">&gt; 115</Td>
                                    <Td bg="red.500" color="white" textAlign="center">&lt; 80</Td>
                                    <Td bg="red.500" color="white" textAlign="center">3</Td>
                                    <Td bg="red.500" color="white" textAlign="center">14%</Td>
                                </Tr>
                            </Tbody>
                        </Table>

                        <Table variant="simple" size="sm" w="48%" h="200px">
                            <Tbody>
                                <Tr>
                                    <Td color="black" textAlign="left">Min</Td>
                                    <Td textAlign="right">56.00</Td>
                                </Tr>
                                <Tr>
                                    <Td color="black" textAlign="left">Max</Td>
                                    <Td textAlign="right">116.00</Td>
                                </Tr>
                                <Tr>
                                    <Td color="black" textAlign="left">Average</Td>
                                    <Td textAlign="right">92.55</Td>
                                </Tr>
                                <Tr>
                                    <Td color="black" textAlign="left">Standard Deviation</Td>
                                    <Td textAlign="right">14.68</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </HStack>
                    <Box width="full" height="300px" position='relative'>
                        <Scatter width="full" height="300px"
                            plugins={[deviationLinesPlugin]}
                            data={chartData}
                            options={options} />
                    </Box>
                </>
            ) : (
                <Center w="full" h="full" flexDirection="column">
                    <Progress size="xs" isIndeterminate w="80%" />
                </Center>
            )}
        </VStack>
    );
};

export default LotLabReport;
