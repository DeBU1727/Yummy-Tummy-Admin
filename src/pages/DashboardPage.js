import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, ToggleButtonGroup, ToggleButton, 
  CircularProgress, Container, Fade, Stack, Avatar 
} from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../api';

// Branding Colors from Reference
const BRAND = {
  primary: '#EB4D4B',    // Coral Red
  secondary: '#F0932B',  // Golden Orange
  accent: '#22C55E',     // Mint Green
  bg: '#FFFAF0',         // Warm Cream
  text: '#2D3436'
};

const CHART_COLORS = [BRAND.primary, BRAND.secondary, BRAND.accent, '#6C5CE7', '#00CEC9'];

const DashboardPage = () => {
  const [filter, setFilter] = useState('MONTH');
  const [salesData, setSalesData] = useState({ totalSales: 0, chartData: [] });
  const [topSellers, setTopSellers] = useState([]);
  const [sourceRatio, setSourceRatio] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState({ orderStatusRatio: [], financialSummary: { totalEarnings: 0, totalRefunds: 0 } });
  const [loading, setLoading] = useState(true);

  // Helper to get start and end dates based on filter
  const getStartAndEndDate = (currentFilter) => {
    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now); // End date is always 'now' for current data

    endDate.setHours(23, 59, 59, 999); // End of current day

    if (currentFilter === 'TODAY') {
      startDate.setHours(0, 0, 0, 0);
    } else if (currentFilter === 'WEEK') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (currentFilter === 'MONTH') {
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
    } else if (currentFilter === 'YEAR') {
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
    }
    return { startDate, endDate };
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getStartAndEndDate(filter);
      const isoStartDate = startDate.toISOString();
      const isoEndDate = endDate.toISOString();

      const [salesRes, ratioRes, topRes, summaryRes] = await Promise.all([
        api.get(`/admin/analytics/sales-overview?startDate=${isoStartDate}`),
        api.get(`/admin/analytics/source-ratio?startDate=${isoStartDate}`), // Source ratio might also need endDate if its calculation changes
        api.get(`/admin/analytics/top-sellers?startDate=${isoStartDate}`), // Top sellers might also need endDate
        api.get(`/admin/analytics/summary?startDate=${isoStartDate}&endDate=${isoEndDate}`)
      ]);

      setSalesData(salesRes.data);
      setSourceRatio(ratioRes.data);
      setTopSellers(topRes.data);
      setAnalyticsSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
      <CircularProgress sx={{ color: BRAND.primary }} />
      <Typography sx={{ mt: 2, fontWeight: 700, color: BRAND.primary }}>Cooking your data...</Typography>
    </Box>
  );

  // Calculate total orders for percentage calculation
  const totalOrders = analyticsSummary.orderStatusRatio.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Box sx={{ backgroundColor: BRAND.bg, minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <Avatar sx={{ bgcolor: BRAND.primary, width: 45, height: 45, boxShadow: '0 4px 12px rgba(235, 77, 75, 0.3)' }}>
                <AnalyticsIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 900, color: BRAND.text }}>
                Admin <span style={{ color: BRAND.primary }}>Dashboard</span>
              </Typography>
            </Stack>
            <Typography variant="body1" color="text.secondary">Monitor your restaurant's performance at a glance.</Typography>
          </Box>

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
            sx={{ 
              bgcolor: '#fff', 
              borderRadius: 4, 
              p: 0.5, 
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: 3.5,
                px: 3,
                fontWeight: 800,
                textTransform: 'none',
                '&.Mui-selected': {
                  bgcolor: BRAND.primary,
                  color: '#fff',
                  '&:hover': { bgcolor: '#d44646' }
                }
              }
            }}
          >
            <ToggleButton value="TODAY">Today</ToggleButton>
            <ToggleButton value="WEEK">Weekly</ToggleButton>
            <ToggleButton value="MONTH">Monthly</ToggleButton>
            <ToggleButton value="YEAR">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Grid container spacing={4}>
          {/* Sales Overview Chart */}
          <Grid item xs={12} lg={8}>
            <Fade in timeout={800}>
              <Paper sx={{ 
                p: 4, 
                height: 450, 
                borderRadius: 8, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.02)',
                position: 'relative'
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ color: BRAND.secondary }} /> Sales Overview
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">TOTAL REVENUE</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: BRAND.primary }}>₹{salesData.totalSales.toLocaleString()}</Typography>
                  </Box>
                </Stack>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={salesData.chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BRAND.primary} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={BRAND.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Line 
                      type="smooth" 
                      dataKey="amount" 
                      stroke={BRAND.primary} 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: BRAND.primary, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Fade>
          </Grid>

          {/* Source Ratio Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Fade in timeout={1000}>
              <Paper sx={{ 
                p: 4, 
                height: 450, 
                borderRadius: 8, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4, textAlign: 'left' }}>Order Channels</Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={sourceRatio}
                      cx="50%" cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="count"
                      nameKey="source"
                      stroke="none"
                    >
                      {sourceRatio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Fade>
          </Grid>

          {/* Order Status Ratio & Financial Summary */}
          <Grid item xs={12}>
            <Fade in timeout={1400}>
              <Paper sx={{ 
                p: 4, 
                borderRadius: 8, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Order & Financial Insights</Typography>
                
                <Grid container spacing={3}>
                  {/* Order Status Ratio */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Order Status Distribution</Typography>
                    <Grid container spacing={1}>
                      {analyticsSummary.orderStatusRatio.map((entry, index) => (
                        <Grid item xs={12} key={entry.status}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: index % 2 === 0 ? '#fcfcfc' : '#ffffff', borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: CHART_COLORS[index % CHART_COLORS.length] }}>
                              {entry.status.replace('_', ' ')}
                            </Typography>
                            <Typography variant="body2">
                              {entry.count} ({totalOrders > 0 ? ((entry.count / totalOrders) * 100).toFixed(1) : 0}%)
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Financial Summary */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Financial Summary</Typography>
                    <Box sx={{ p: 2, bgcolor: '#fcfcfc', borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Earnings:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND.accent }}>
                          ₹{analyticsSummary.financialSummary.totalEarnings.toLocaleString()}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Total Refunds:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: BRAND.primary }}>
                          ₹{analyticsSummary.financialSummary.totalRefunds.toLocaleString()}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          </Grid>

          {/* Top Sellers Bar Chart */}
          <Grid item xs={12}>
            <Fade in timeout={1200}>
              <Paper sx={{ 
                p: 4, 
                borderRadius: 8, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                minHeight: 400
              }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Top Selling Items</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSellers} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#fff9f0'}} />
                    <Bar 
                      dataKey="quantity" 
                      fill={BRAND.secondary} 
                      radius={[10, 10, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DashboardPage;