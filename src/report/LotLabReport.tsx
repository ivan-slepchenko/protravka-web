import React, { useEffect, useState } from "react";
import { Box, Center, Text, Progress, Table, Thead, Tbody, Tr, Th, Td, HStack, VStack, Tooltip } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { fetchOrderExecution, fetchTkwMeasurementsByExecutionId, TkwMeasurement } from "../store/executionSlice";
import { Chart as ChartReact } from 'react-chartjs-2';
import type { Plugin } from 'chart.js';
import { Chart, registerables } from 'chart.js/auto';
import { useTranslation } from 'react-i18next';
import 'chartjs-adapter-moment';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { fetchOrderById } from "../store/ordersSlice";
import { Order } from "../store/newOrderSlice";
import { AppDispatch } from "../store/store";
import { useDispatch } from "react-redux";


Chart.register(...registerables, CandlestickController, CandlestickElement);

const LotLabReport: React.FC = () => {
    const { t } = useTranslation();
    const dispatch: AppDispatch = useDispatch();
    const { orderId } = useParams<{ orderId: string }>();
    const [tkwMeasurements, setTkwMeasurements] = useState<TkwMeasurement[]>([]);
    const [order, setOrder] = useState<Order | undefined>();


    useEffect(() => {
        if (orderId) {
            fetchOrderExecution(orderId).then((orderExecution) => {
                console.log('Fetched orderExecution:', orderExecution);
                if (orderExecution?.id) {
                    fetchTkwMeasurementsByExecutionId(orderExecution.id)
                        .then((data: TkwMeasurement[]) => {
                            console.log('Fetched TKW measurements:', data);
                            setTkwMeasurements(data.filter(measurement=>measurement.probeDate !== null))
                        })
                        .catch(error => console.error('Failed to fetch TKW measurements:', error));
                }
            });
            dispatch(fetchOrderById(orderId))
                .unwrap()
                .then(order => {
                    console.log('Fetched order:', order);
                    setOrder(order);
                })
                .catch(error => console.error('Failed to fetch order:', error));
        }
    }, [orderId]);

    const tkwData = tkwMeasurements.filter((measurement) => measurement.probeDate !== undefined).flatMap((measurement) => [
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe1! },
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe2! },
        { x: new Date(measurement.creationDate).getTime(), y: measurement.tkwProbe3! },
    ].filter(point => point.y !== undefined)) || [];

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

    const deviationLinesPlugin: Plugin = {
        id: "deviationLines",
        beforeDatasetsDraw: (chart) => {
            const { ctx, scales: { x, y } } = chart;
            ctx.save();
            
            const xStartCoord = x.left;
            const xEndCoord = x.right;

            const drawLine = (yValue: number, color: string, dash: number[], label: string) => {
                const yCoord = y.getPixelForValue(yValue);
                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5;
                ctx.setLineDash(dash);
                ctx.moveTo(xStartCoord, yCoord);
                ctx.lineTo(xEndCoord, yCoord);
                ctx.stroke();
                ctx.fillStyle = color;
                ctx.fillText(label, xEndCoord + 5, yCoord);
            };

            drawLine(averageTkw * 1.05, 'orange', [5, 5], 'Upper Limit 5%');
            drawLine(averageTkw * 0.95, 'orange', [5, 5], 'Lower Limit 5%');
            drawLine(averageTkw * 1.10, 'red', [], 'Upper Limit 10%');
            drawLine(averageTkw * 0.90, 'red', [], 'Lower Limit 10%');
            drawLine(averageTkw, 'blue', [], 'Average TKW');
            if (order !== undefined && order.tkw !== null) drawLine(order.tkw, 'green', [], 'Order TKW');
        }
    }; 

    const generateCandlestickData = (measurements: TkwMeasurement[], yScaleRange: number) => {
        const offset = yScaleRange * 0.02; // 2% of the y-axis range
        return measurements.map((measurement) => {
            const tkwValues = [measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3].filter(value => value !== undefined) as number[];
            const minTkw = Math.min(...tkwValues);
            const maxTkw = Math.max(...tkwValues);
            const avgTkw = tkwValues.reduce((sum, value) => sum + value, 0) / tkwValues.length;
            return {
                x: new Date(measurement.creationDate).getTime(),
                o: avgTkw - offset,
                h: maxTkw,
                l: minTkw,
                c: avgTkw + offset,
                min: minTkw,
                max: maxTkw,
                avg: avgTkw
            };
        });
    };

    const yScaleRange = Math.max(...tkwData.map(d => d.y)) - Math.min(...tkwData.map(d => d.y));

    const legendItems = [
        { color: 'blue', label: 'Average TKW' },
        { color: 'green', label: 'Order TKW' },
        { color: 'orange', label: 'Soft Limit 5%' },
        { color: 'red', label: 'Hard Limit 10%' },
    ];

    const handleBarClick = (_: any, __: any, chart: any) => {
        const clickedRawData = chart.tooltip?.$context?.tooltipItems[0]?.raw;
        console.log('Clicked data:', clickedRawData);
    };

    return (
        <VStack w="full" height="auto" position="relative" alignItems={"start"} py={8}>
            {(tkwMeasurements.length > 0 && order !== undefined) ? (
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
                    <HStack mt={8} justifyContent={'center'} spacing={4} w='full'>
                        {legendItems.map((item, index) => (
                            <HStack key={index} spacing={2} alignItems="center">
                                <Box width="20px" height="10px" backgroundColor={item.color} />
                                <Text>{item.label}</Text>
                            </HStack>
                        ))}
                    </HStack>
                    <Box width="full" height="300px">
                        <ChartReact
                            type='candlestick'
                            plugins={[deviationLinesPlugin]}
                            width="100%"
                            height="300px"
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                onClick: handleBarClick,
                                interaction: {
                                    mode: "index",
                                },
                                scales: {
                                    x: {
                                        type: 'time',
                                        time: {
                                            unit: 'month'
                                        },
                                        title: {
                                            display: false,
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
                                            maxRotation: 45,
                                            minRotation: 45,
                                        },
                                        min: tkwData.length > 0 ? Math.min(...tkwData.map(d => d.x)) - 1 * 60 * 60 * 1000 : new Date().getTime() - 86400000, // 2 hours before first data point or 1 day before now
                                        max: tkwData.length > 0 ? Math.max(...tkwData.map(d => d.x)) + 1 * 60 * 60 * 1000 : new Date().getTime() + 86400000, // 2 hours after last data point or 1 day after now
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
                                                const { min, max, avg } = context.raw;
                                                return [
                                                    `Min: ${min.toFixed(2)} gr.`,
                                                    `Max: ${max.toFixed(2)} gr.`,
                                                    `Avg: ${avg.toFixed(2)} gr.`,
                                                    `Overall Avg: ${averageTkw.toFixed(2)} gr.`
                                                ];
                                            },
                                            
                                        },
                                        displayColors: false
                                    },
                                    legend: {
                                        display: false,
                                        
                                    },
                                }
                            }}  
                            data={{
                                datasets: [
                                    {
                                        label: t('lot_report.tkw_measurements'),
                                        data: generateCandlestickData(tkwMeasurements, yScaleRange),
                                        barThickness: 8,
                                        backgroundColor: 'blue',
                                        borderWidth: 3,
                                        backgroundColors: {
                                            up: 'blue',
                                            down: 'blue',
                                            unchanged: 'blue'
                                        },
                                        borderColor: 'blue',
                                    }
                                ]
                            }}
                        />
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
