/* eslint-disable */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  PlaylistAdd as PlaylistAddIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import { SuccessWindow, ErrorWindow } from 'components/';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: '#4caf50' },
  { value: 'medium', label: 'Medium', color: '#ff9800' },
  { value: 'hard', label: 'Hard', color: '#f44336' },
];

const SET_OPTIONS = [
  { value: 'a', label: 'Set A' },
  { value: 'b', label: 'Set B' },
];

const OUTPUT_TYPE_OPTIONS = [
  { value: 'exact', label: 'Exact Match' },
  { value: 'ignore_whitespace', label: 'Ignore Whitespace' },
  { value: 'ignore_case', label: 'Ignore Case' },
  { value: 'float', label: 'Float Comparison' },
];

const EMPTY_TEST_CASE = {
  input: '',
  expected_output: '',
  output_type: 'exact',
};

const CreateQuestionPage = () => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    points: '',
    difficulty: '',
    totalCases: '',
    samples: '',
    set: 'a',
  });
  
  const [testCases, setTestCases] = useState([{ ...EMPTY_TEST_CASE }]);
  const [testCasesExpanded, setTestCasesExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleTestCaseChange = (index, field) => (e) => {
    const newTestCases = [...testCases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: e.target.value,
    };
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { ...EMPTY_TEST_CASE }]);
  };

  const removeTestCase = (index) => {
    if (testCases.length > 1) {
      const newTestCases = testCases.filter((_, i) => i !== index);
      setTestCases(newTestCases);
    }
  };

  const validateForm = () => {
    const { title, body, points, difficulty, samples } = formData;
    
    if (!title.trim()) {
      ErrorWindow.fire({ title: 'Missing Field', text: 'Please enter a question title.' });
      return false;
    }
    if (!body.trim()) {
      ErrorWindow.fire({ title: 'Missing Field', text: 'Please enter the question body/description.' });
      return false;
    }
    if (!points || isNaN(parseInt(points)) || parseInt(points) <= 0) {
      ErrorWindow.fire({ title: 'Invalid Points', text: 'Please enter a valid positive number for points.' });
      return false;
    }
    if (!difficulty) {
      ErrorWindow.fire({ title: 'Missing Field', text: 'Please select a difficulty level.' });
      return false;
    }
    if (!samples.trim()) {
      ErrorWindow.fire({ title: 'Missing Field', text: 'Please provide sample input/output.' });
      return false;
    }

    // Validate test cases
    const validTestCases = testCases.filter(tc => tc.input.trim() || tc.expected_output.trim());
    if (validTestCases.length === 0) {
      ErrorWindow.fire({ title: 'Missing Test Cases', text: 'Please add at least one test case.' });
      return false;
    }
    
    for (let i = 0; i < validTestCases.length; i++) {
      const tc = validTestCases[i];
      if (!tc.input.trim()) {
        ErrorWindow.fire({ title: 'Invalid Test Case', text: `Test case ${i + 1} is missing input.` });
        return false;
      }
      if (!tc.expected_output.trim()) {
        ErrorWindow.fire({ title: 'Invalid Test Case', text: `Test case ${i + 1} is missing expected output.` });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Filter valid test cases
    const validTestCases = testCases.filter(tc => tc.input.trim() && tc.expected_output.trim());
    
    try {
      // Create the question first
      const res = await postFetch(`${baseURL}/generatequestion`, {
        title: formData.title.trim(),
        body: formData.body.trim(),
        points: formData.points,
        difficulty: formData.difficulty,
        total_cases: validTestCases.length,
        samples: formData.samples.trim(),
        set: formData.set,
      });

      if (res.success) {
        const questionId = res.results._id;
        
        // Now create the test cases
        const testCaseRes = await postFetch(`${baseURL}/testcases/create-multiple`, {
          problem_id: questionId,
          testCases: validTestCases.map(tc => ({
            input: tc.input.trim(),
            expected_output: tc.expected_output.trim(),
            output_type: tc.output_type,
          })),
        });

        if (testCaseRes.success) {
          SuccessWindow.fire({ 
            title: 'Question Created!',
            text: `"${formData.title}" has been created with ${validTestCases.length} test case(s).`
          });
        } else {
          // Question created but test cases failed
          SuccessWindow.fire({ 
            title: 'Partial Success',
            text: `Question created, but test cases failed: ${testCaseRes.message || 'Unknown error'}. Please add them manually.`
          });
        }
        
        // Reset form
        setFormData({
          title: '',
          body: '',
          points: '',
          difficulty: '',
          totalCases: '',
          samples: '',
          set: 'a',
        });
        setTestCases([{ ...EMPTY_TEST_CASE }]);
      } else {
        ErrorWindow.fire({ 
          title: 'Creation Failed', 
          text: res.error || res.results || 'An unknown error occurred.' 
        });
      }
    } catch (err) {
      ErrorWindow.fire({ 
        title: 'Request Failed', 
        text: err.message || String(err) 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      title: '',
      body: '',
      points: '',
      difficulty: '',
      totalCases: '',
      samples: '',
      set: 'a',
    });
    setTestCases([{ ...EMPTY_TEST_CASE }]);
  };

  const getDifficultyColor = (difficulty) => {
    const option = DIFFICULTY_OPTIONS.find((opt) => opt.value === difficulty);
    return option?.color || '#757575';
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        mx: 'auto',
        height: 'calc(100vh - 64px)', // adjust if you have a topbar, else use 100vh
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#b3b3b3 #f5f5f5',
        background: 'transparent',
      }}
    >
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha('#009fac', 0.1)} 0%, ${alpha('#395395', 0.1)} 100%)`,
          border: '1px solid',
          borderColor: alpha('#009fac', 0.2),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha('#009fac', 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CodeIcon sx={{ fontSize: 32, color: '#009fac' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={600} color="text.primary">
              Create New Question
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Add a new coding challenge to the competition
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Form Section */}
        <Grid item xs={12} lg={8}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Title Input */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon fontSize="small" color="primary" />
                  Question Title
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter a descriptive title for the question..."
                  value={formData.title}
                  onChange={handleChange('title')}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              {/* Question Body */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Question Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  placeholder="Write the complete problem statement here. Include:
• Problem description
• Input format
• Output format
• Constraints
• Examples with explanations"
                  value={formData.body}
                  onChange={handleChange('body')}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: 'monospace',
                    },
                  }}
                />
              </Box>

              {/* Samples */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Sample Input/Output
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="*insert Gdocs Link*"
                  value={formData.samples}
                  onChange={handleChange('samples')}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: 'monospace',
                      backgroundColor: alpha('#000', 0.02),
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Configuration Row */}
              <Grid container spacing={2}>
                {/* Difficulty */}
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SpeedIcon fontSize="small" sx={{ color: getDifficultyColor(formData.difficulty) }} />
                    Difficulty
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.difficulty}
                      onChange={handleChange('difficulty')}
                      displayEmpty
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="" disabled>
                        <em>Select difficulty</em>
                      </MenuItem>
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: option.color,
                              }}
                            />
                            <span>{option.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Points */}
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon fontSize="small" color="warning" />
                    Points
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="100"
                    value={formData.points}
                    onChange={handleChange('points')}
                    size="small"
                    inputProps={{ min: 1 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>

                {/* Test Cases Count (Auto-calculated) */}
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon fontSize="small" color="success" />
                    Test Cases
                  </Typography>
                  <Box
                    sx={{
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: alpha('#4caf50', 0.05),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length} test case(s)
                    </Typography>
                  </Box>
                </Grid>

                {/* Set */}
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Question Set
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.set}
                      onChange={handleChange('set')}
                      sx={{ borderRadius: 2 }}
                    >
                      {SET_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Test Cases Section */}
          <Card 
            elevation={0} 
            sx={{ 
              mt: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Test Cases Header */}
              <Stack 
                direction="row" 
                alignItems="center" 
                justifyContent="space-between"
                sx={{ mb: 2, cursor: 'pointer' }}
                onClick={() => setTestCasesExpanded(!testCasesExpanded)}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ScienceIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Test Cases
                  </Typography>
                  <Chip 
                    size="small" 
                    label={testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
                <IconButton size="small">
                  {testCasesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Stack>

              <Collapse in={testCasesExpanded}>
                <Stack spacing={2}>
                  {testCases.map((testCase, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: alpha('#000', 0.01),
                        position: 'relative',
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                          Test Case #{index + 1}
                        </Typography>
                        <Tooltip title={testCases.length > 1 ? "Remove test case" : "At least one test case required"}>
                          <span>
                            <IconButton 
                              size="small" 
                              onClick={() => removeTestCase(index)}
                              disabled={testCases.length <= 1}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': { backgroundColor: alpha('#f44336', 0.1) },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>

                      <Grid container spacing={2}>
                        {/* Input */}
                        <Grid item xs={12} md={5}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            Input
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter test input..."
                            value={testCase.input}
                            onChange={handleTestCaseChange(index, 'input')}
                            variant="outlined"
                            size="small"
                            sx={{
                              mt: 0.5,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                backgroundColor: '#fff',
                              },
                            }}
                          />
                        </Grid>

                        {/* Expected Output */}
                        <Grid item xs={12} md={5}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            Expected Output
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter expected output..."
                            value={testCase.expected_output}
                            onChange={handleTestCaseChange(index, 'expected_output')}
                            variant="outlined"
                            size="small"
                            sx={{
                              mt: 0.5,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                backgroundColor: '#fff',
                              },
                            }}
                          />
                        </Grid>

                        {/* Output Type */}
                        <Grid item xs={12} md={2}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            Match Type
                          </Typography>
                          <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                            <Select
                              value={testCase.output_type}
                              onChange={handleTestCaseChange(index, 'output_type')}
                              sx={{ 
                                borderRadius: 1.5,
                                backgroundColor: '#fff',
                                fontSize: '0.875rem',
                              }}
                            >
                              {OUTPUT_TYPE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                  {/* Add Test Case Button */}
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PlaylistAddIcon />}
                    onClick={addTestCase}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderStyle: 'dashed',
                      fontWeight: 500,
                      textTransform: 'none',
                      '&:hover': {
                        borderStyle: 'dashed',
                        backgroundColor: alpha('#395395', 0.05),
                      },
                    }}
                  >
                    Add Another Test Case
                  </Button>
                </Stack>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview & Actions Panel */}
        <Grid item xs={12} lg={4}>
          {/* Preview Card */}
          <Card 
            elevation={0} 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Question Preview
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Title</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formData.title || '—'}
                  </Typography>
                </Box>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {formData.difficulty && (
                    <Chip
                      size="small"
                      label={formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                      sx={{
                        backgroundColor: alpha(getDifficultyColor(formData.difficulty), 0.15),
                        color: getDifficultyColor(formData.difficulty),
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {formData.points && (
                    <Chip
                      size="small"
                      icon={<TrophyIcon sx={{ fontSize: 16 }} />}
                      label={`${formData.points} pts`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length > 0 && (
                    <Chip
                      size="small"
                      icon={<ScienceIcon sx={{ fontSize: 16 }} />}
                      label={`${testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length} test cases`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Box>
                  <Typography variant="caption" color="text.secondary">Set</Typography>
                  <Typography variant="body2">
                    {SET_OPTIONS.find(s => s.value === formData.set)?.label || 'Set A'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              background: alpha('#009fac', 0.02),
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Actions
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="major"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: `0 4px 14px ${alpha('#009fac', 0.4)}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha('#009fac', 0.5)}`,
                    },
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Question'}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={handleClear}
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                  }}
                >
                  Clear Form
                </Button>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                💡 <strong>Tip:</strong> Test cases will be created along with the question. Make sure each test case has both input and expected output filled in.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateQuestionPage;
