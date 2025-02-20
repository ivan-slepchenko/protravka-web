import React, { useEffect, useState } from "react";
import { Box, Center, Text, Progress, Table, Thead, Tbody, Tr, Th, Td, HStack, VStack, Tooltip } from "@chakra-ui/react";
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
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe1! },
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe2! },
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe3! },
    ].filter(point => point.y !== undefined)) || [];

    console.log('tkwData:', tkwData);

    const averageTkw = tkwMeasurements.length > 0 ? tkwMeasurements.reduce((sum, measurement) => {
        const total = (measurement.tkwProbe1 || 0) + (measurement.tkwProbe2 || 0) + (measurement.tkwProbe3 || 0);
        return sum + total / 3;
    }, 0) / tkwMeasurements.length : 0;

    const upperLimit5 = averageTkw * 1.05;
    const lowerLimit5 = averageTkw * 0.95;
    const upperLimit10 = averageTkw * 1.10;
    const lowerLimit10 = averageTkw * 0.90;

    const okSamples = tkwMeasurements.filter(measurement => 
        (measurement.tkwProbe1 && measurement.tkwProbe1 >= lowerLimit5 && measurement.tkwProbe1 <= upperLimit5) ||
        (measurement.tkwProbe2 && measurement.tkwProbe2 >= lowerLimit5 && measurement.tkwProbe2 <= upperLimit5) ||
        (measurement.tkwProbe3 && measurement.tkwProbe3 >= lowerLimit5 && measurement.tkwProbe3 <= upperLimit5)
    ).length;

    const monitoringSamples = tkwMeasurements.filter(measurement => 
        (measurement.tkwProbe1 && ((measurement.tkwProbe1 >= lowerLimit10 && measurement.tkwProbe1 < lowerLimit5) || (measurement.tkwProbe1 > upperLimit5 && measurement.tkwProbe1 <= upperLimit10))) ||
        (measurement.tkwProbe2 && ((measurement.tkwProbe2 >= lowerLimit10 && measurement.tkwProbe2 < lowerLimit5) || (measurement.tkwProbe2 > upperLimit5 && measurement.tkwProbe2 <= upperLimit10))) ||
        (measurement.tkwProbe3 && ((measurement.tkwProbe3 >= lowerLimit10 && measurement.tkwProbe3 < lowerLimit5) || (measurement.tkwProbe3 > upperLimit5 && measurement.tkwProbe3 <= upperLimit10)))
    ).length;

    const quickImprovementSamples = tkwMeasurements.filter(measurement => 
        (measurement.tkwProbe1 && (measurement.tkwProbe1 < lowerLimit10 || measurement.tkwProbe1 > upperLimit10)) ||
        (measurement.tkwProbe2 && (measurement.tkwProbe2 < lowerLimit10 || measurement.tkwProbe2 > upperLimit10)) ||
        (measurement.tkwProbe3 && (measurement.tkwProbe3 < lowerLimit10 || measurement.tkwProbe3 > upperLimit10))
    ).length;

    const totalSamples = tkwMeasurements.length * 3;
    const okPercentage = (okSamples / totalSamples) * 100;
    const monitoringPercentage = (monitoringSamples / totalSamples) * 100;
    const quickImprovementPercentage = (quickImprovementSamples / totalSamples) * 100;

    const averageDeviation = tkwData.length > 0 ? tkwData.reduce((acc, d) => acc + Math.abs(d.y - averageTkw), 0) / tkwData.length : 0;

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
        <VStack w="full" height="auto" position="relative" alignItems={"start"} py={8}>
            {tkwMeasurements.length > 0 ? (
                <>
                    <Text fontSize="lg" fontWeight="bold" textAlign="center" my={4}>
                        {t('lot_report.tkw_measurements')}
                    </Text>
                    <HStack w="full" spacing={4} justifyContent="space-between" alignItems={"flex-start"}>
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
                                    <Tooltip label="Category of the measurement" aria-label="Category">
                                        <Td bg="green.300" color="black" textAlign="center">OK</Td>
                                    </Tooltip>
                                    <Tooltip label="Upper limit for OK category" aria-label="Upper Limit">
                                        <Td bg="green.300" color="black" textAlign="center">{upperLimit5.toFixed(2)}</Td>
                                    </Tooltip>
                                    <Tooltip label="Lower limit for OK category" aria-label="Lower Limit">
                                        <Td bg="green.300" color="black" textAlign="center">{lowerLimit5.toFixed(2)}</Td>
                                    </Tooltip>
                                    <Tooltip label="Number of samples in OK category" aria-label="Samples">
                                        <Td bg="green.300" color="black" textAlign="center">{okSamples}</Td>
                                    </Tooltip>
                                    <Tooltip label="Percentage of samples in OK category" aria-label="Percentage">
                                        <Td bg="green.300" color="black" textAlign="center">{okPercentage.toFixed(2)}%</Td>
                                    </Tooltip>
                                </Tr>
                                <Tr>
                                    <Tooltip label="Category of the measurement" aria-label="Category">
                                        <Td bg="yellow.300" color="black" textAlign="center">Monitoring</Td>
                                    </Tooltip>
                                    <Tooltip label="Upper limit for Monitoring category" aria-label="Upper Limit">
                                        <Td bg="yellow.300" color="black" textAlign="center">{upperLimit10.toFixed(2)}</Td>
                                    </Tooltip>
                                    <Tooltip label="Lower limit for Monitoring category" aria-label="Lower Limit">
                                        <Td bg="yellow.300" color="black" textAlign="center">{lowerLimit10.toFixed(2)}</Td>
                                    </Tooltip>
                                    <Tooltip label="Number of samples in Monitoring category" aria-label="Samples">
                                        <Td bg="yellow.300" color="black" textAlign="center">{monitoringSamples}</Td>
                                    </Tooltip>
                                    <Tooltip label="Percentage of samples in Monitoring category" aria-label="Percentage">
                                        <Td bg="yellow.300" color="black" textAlign="center">{monitoringPercentage.toFixed(2)}%</Td>
                                    </Tooltip>
                                </Tr>
                                <Tr>
                                    <Tooltip label="Category of the measurement" aria-label="Category">
                                        <Td bg="red.500" color="white" textAlign="center">Quick Improvement Needed</Td>
                                    </Tooltip>
                                    <Tooltip label="Upper limit for Quick Improvement Needed category" aria-label="Upper Limit">
                                        <Td bg="red.500" color="white" textAlign="center">&gt; {upperLimit10.toFixed(2)}</Td>
                                    </Tooltip>
                                    <Tooltip label="Lower limit for Quick Improvement Needed category" aria-label="Lower Limit">
                                        <Td bg="red.500" color="white" textAlign="center">&lt; {lowerLimit10.toFixed(2)}</Td>
                                    </Tooltip>
                                    <Tooltip label="Number of samples in Quick Improvement Needed category" aria-label="Samples">
                                        <Td bg="red.500" color="white" textAlign="center">{quickImprovementSamples}</Td>
                                    </Tooltip>
                                    <Tooltip label="Percentage of samples in Quick Improvement Needed category" aria-label="Percentage">
                                        <Td bg="red.500" color="white" textAlign="center">{quickImprovementPercentage.toFixed(2)}%</Td>
                                    </Tooltip>
                                </Tr>
                            </Tbody>
                        </Table>

                        <Table variant="simple" size="sm" w="48%">
                            <Tbody>
                                <Tr>
                                    <Tooltip label="Minimum TKW value" aria-label="Min">
                                        <Td color="black" textAlign="left">Min</Td>
                                    </Tooltip>
                                    <Tooltip label="Value of the minimum TKW" aria-label="Min Value">
                                        <Td textAlign="right">{Math.min(...tkwData.map(d => d.y)).toFixed(2)}</Td>
                                    </Tooltip>
                                </Tr>
                                <Tr>
                                    <Tooltip label="Maximum TKW value" aria-label="Max">
                                        <Td color="black" textAlign="left">Max</Td>
                                    </Tooltip>
                                    <Tooltip label="Value of the maximum TKW" aria-label="Max Value">
                                        <Td textAlign="right">{Math.max(...tkwData.map(d => d.y)).toFixed(2)}</Td>
                                    </Tooltip>
                                </Tr>
                                <Tr>
                                    <Tooltip label="Average TKW value" aria-label="Average">
                                        <Td color="black" textAlign="left">Average</Td>
                                    </Tooltip>
                                    <Tooltip label="Value of the average TKW" aria-label="Average Value">
                                        <Td textAlign="right">{averageTkw.toFixed(2)}</Td>
                                    </Tooltip>
                                </Tr>
                                <Tr>
                                    <Tooltip label="Average deviation from the average TKW" aria-label="Average Deviation">
                                        <Td color="black" textAlign="left">Average Deviation</Td>
                                    </Tooltip>
                                    <Tooltip label="Value of the average deviation" aria-label="Average Deviation Value">
                                        <Td textAlign="right">{averageDeviation.toFixed(2)}</Td>
                                    </Tooltip>
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
