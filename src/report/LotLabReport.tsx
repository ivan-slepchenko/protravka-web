import React, { useEffect, useState } from "react";
import { Box, Center, Text, Progress, Table, Thead, Tbody, Tr, Th, Td, HStack, VStack, Tooltip } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOrderExecutionForOrder, fetchTkwMeasurementsByExecutionId, OrderExecution, TkwMeasurement } from "../store/executionSlice";
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
    const navigate = useNavigate();
    const [tkwMeasurements, setTkwMeasurements] = useState<TkwMeasurement[]>([]);
    const [order, setOrder] = useState<Order | undefined>();
    const [orderExecution, setOrderExecution] = useState<OrderExecution | undefined>();


    useEffect(() => {
        if (orderId) {
            fetchOrderExecutionForOrder(orderId).then((orderExecution) => {
                console.log('Fetched orderExecution:', orderExecution);
                setOrderExecution(orderExecution);
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
        { x: new Date(measurement.probeDate!).getTime(), y: measurement.tkwProbe1! },
        { x: new Date(measurement.probeDate!).getTime(), y: measurement.tkwProbe2! },
        { x: new Date(measurement.probeDate!).getTime(), y: measurement.tkwProbe3! },
    ].filter(point => point.y !== undefined)) || [];

    const averageTkw = tkwMeasurements.length > 0 ? tkwMeasurements.reduce((sum, measurement) => {
        const total = (measurement.tkwProbe1 || 0) + (measurement.tkwProbe2 || 0) + (measurement.tkwProbe3 || 0);
        return sum + total / 3;
    }, 0) / tkwMeasurements.length : 0;

    const upperLimit5 = averageTkw * 1.05;
    const lowerLimit5 = averageTkw * 0.95;
    const upperLimit10 = averageTkw * 1.10;
    const lowerLimit10 = averageTkw * 0.90;

    const okSamples = tkwMeasurements.filter(measurement => {
        const probes = [measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3].filter(n => n !== undefined);
        if (probes.length === 0) return false;
        const avg = probes.reduce((sum, val) => sum + val!, 0) / probes.length;
        return avg >= lowerLimit5 && avg <= upperLimit5;
    }).length;

    const monitoringSamples = tkwMeasurements.filter(measurement => {
        const probes = [measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3].filter(n => n !== undefined);
        if (probes.length === 0) return false;
        const avg = probes.reduce((sum, val) => sum + val!, 0) / probes.length;
        return (avg >= lowerLimit10 && avg < lowerLimit5) || (avg > upperLimit5 && avg <= upperLimit10);
    }).length;

    const quickImprovementSamples = tkwMeasurements.filter(measurement => {
        const probes = [measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3].filter(n => n !== undefined);
        if (probes.length === 0) return false;
        const avg = probes.reduce((sum, val) => sum + val!, 0) / probes.length;
        return avg < lowerLimit10 || avg > upperLimit10;
    }).length;

    const totalSamples = okSamples + monitoringSamples + quickImprovementSamples;
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

            const drawLine = (yValue: number, color: string, dash: number[], label: string, onClick?: () => void) => {
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

                if (onClick) {
                    chart.canvas.addEventListener('click', (event) => {
                        const rect = chart.canvas.getBoundingClientRect();
                        const mouseY = event.clientY - rect.top;
                        if (mouseY >= yCoord - 5 && mouseY <= yCoord + 5) {
                            onClick();
                        }
                    });
                }
            };

            drawLine(averageTkw * 1.05, 'orange', [5, 5], 'Upper Limit 5%');
            drawLine(averageTkw * 0.95, 'orange', [5, 5], 'Lower Limit 5%');
            drawLine(averageTkw * 1.10, 'red', [], 'Upper Limit 10%');
            drawLine(averageTkw * 0.90, 'red', [], 'Lower Limit 10%');
            drawLine(averageTkw, 'blue', [], 'Average TKW');
            if (order !== undefined && order.tkw !== null) {
                drawLine(order.tkw, 'green', [], 'Order TKW', () => {
                    navigate(`/tkw-details/${order.id}`);
                });
            }
        }
    }; 

    const generateCandlestickData = (measurements: TkwMeasurement[], yScaleRange: number) => {
        const offset = yScaleRange * 0.02; // 2% of the y-axis range
        return measurements.map((measurement) => {
            const tkwValues = [measurement.tkwProbe1, measurement.tkwProbe2, measurement.tkwProbe3].filter(value => value !== undefined) as number[];
            const minTkw = Math.min(...tkwValues);
            const maxTkw = Math.max(...tkwValues);
            const avgTkw = tkwValues.reduce((sum, value) => sum + value, 0) / tkwValues.length;
            if (measurement.probeDate === undefined) {
                throw new Error('Probe date is undefined');
            };
            return {
                //these are used by chart
                x: new Date(measurement.probeDate).getTime(),
                o: avgTkw - offset,
                h: maxTkw,
                l: minTkw,
                c: avgTkw + offset,
                //these are used by tooltip and external functionality
                min: minTkw,
                max: maxTkw,
                avg: avgTkw,
                measurementId: measurement.id,
            };
        });
    };

    const yScaleRange = Math.max(...tkwData.map(d => d.y)) - Math.min(...tkwData.map(d => d.y));
    const minYValue = Math.min(...tkwData.map(d => d.y), lowerLimit10, order?.tkw ?? lowerLimit10) - yScaleRange * 0.1;
    const maxYValue = Math.max(...tkwData.map(d => d.y), upperLimit10, order?.tkw ?? upperLimit10) + yScaleRange * 0.1;

    const legendItems = [
        { color: 'blue', label: 'AVG Treated seeds TKW' },
        { color: 'green', label: 'Untreated seeds TKW' },
        { color: 'orange', label: 'Deviation  from AVG 5%' },
        { color: 'red', label: 'Deviation from AVG 10%' },
    ];

    const handleBarClick = (_: any, __: any, chart: any) => {
        if (order === undefined) {
            throw new Error('Order is null, invalid use of TKW chart');
        }
        const clickedRawData = chart.tooltip?.$context?.tooltipItems[0]?.raw;
        if (clickedRawData && clickedRawData.measurementId !== undefined && orderExecution !== undefined) {
            const measurementId = clickedRawData.measurementId;
            navigate(`/tkw-details/${order.id}/${measurementId}?from=lot-lab-report`);
        }
    };

    return (
        <VStack w="full" position="relative" alignItems={"start"} py={8} id="lot-lab-report">
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
                                        <Td bg="green.300" color="black" textAlign="center">{'Deviation from AVG <5%'}</Td>
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
                                        <Td bg="yellow.300" color="black" textAlign="center">{'Deviation from AVG 5-10%'}</Td>
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
                                        <Td bg="red.500" color="white" textAlign="center">{'Deviation from AVG >10%'}</Td>
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
                                            unit: "millisecond"
                                        },
                                        bounds: 'ticks',
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
                                            autoSkip: false,
                                            stepSize: 60000,
                                        },
                                        min: tkwData.length > 0 ? Math.min(...tkwData.map(d => d.x)) : new Date().getTime(), 
                                        max: tkwData.length > 0 ? Math.max(...tkwData.map(d => d.x)) : new Date().getTime(),
                                    },
                                    y: {
                                        title: {
                                            display: true,   
                                            text: t('lot_report.tkw_value'),
                                        },
                                        min: minYValue,
                                        max: maxYValue,
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
