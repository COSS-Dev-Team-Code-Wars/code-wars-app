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
  { value: 'wager', label: 'Wager', color: '#9c27b0' },
  { value: 'hard', label: 'Hard', color: '#f44336' }
  
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
//test
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
        height: '100vh',          // full viewport height
        overflowY: 'auto',        // enable vertical scrolling
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          background: 'linear-gradient(135deg, rgba(0, 159, 172, 0.08) 0%, rgba(57, 83, 149, 0.08) 100%)',
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          maxWidth: 2000,
          mx: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header Section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
            border: '2px solid',
            borderColor: alpha('#009fac', 0.3),
            boxShadow: `0 8px 32px ${alpha('#009fac', 0.15)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2.5}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #009fac 0%, #395395 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px ${alpha('#009fac', 0.4)}`,
              }}
            >
              <CodeIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                Create New Question
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a new coding challenge to the competition
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {/* Main Form Section */}
          <Grid item xs={12} lg={8}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha('#009fac', 0.2),
                overflow: 'hidden',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, #f8fafb 0%, #e8eef3 100%)',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha('#009fac', 0.15)}`,
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Title Input */}
                <Box sx={{ mb: 3.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#009fac' }}>
                    <AssignmentIcon fontSize="small" />
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
                        borderRadius: 2.5,
                        backgroundColor: '#fff',
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: alpha('#009fac', 0.03),
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#fff',
                          boxShadow: `0 0 0 3px ${alpha('#009fac', 0.1)}`,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Question Body */}
                <Box sx={{ mb: 3.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#395395' }}>
                    Question Description
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    placeholder="Write the complete problem statement here. Include:
- Problem description
- Input format
- Output format
- Constraints
- Examples with explanations"
                    value={formData.body}
                    onChange={handleChange('body')}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        fontFamily: 'monospace',
                        backgroundColor: '#fff',
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: alpha('#395395', 0.03),
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#fff',
                          boxShadow: `0 0 0 3px ${alpha('#395395', 0.1)}`,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Samples */}
                <Box sx={{ mb: 3.5 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: '#009fac' }}>
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
                        borderRadius: 2.5,
                        fontFamily: 'monospace',
                        backgroundColor: '#fff',
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: alpha('#000', 0.03),
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#fff',
                          boxShadow: `0 0 0 3px ${alpha('#009fac', 0.1)}`,
                        },
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Configuration Row */}
                <Grid container spacing={2.5}>
                  {/* Difficulty */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SpeedIcon fontSize="small" sx={{ color: getDifficultyColor(formData.difficulty) }} />
                      Difficulty
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formData.difficulty}
                        onChange={handleChange('difficulty')}
                        displayEmpty
                        sx={{
                          borderRadius: 2.5,
                          backgroundColor: '#fff',
                          '&:hover': {
                            backgroundColor: alpha('#000', 0.02),
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          <em>Select difficulty</em>
                        </MenuItem>
                        {DIFFICULTY_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
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
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          borderRadius: 2.5,
                          backgroundColor: '#fff',
                          '&:hover': {
                            backgroundColor: alpha('#000', 0.02),
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* Test Cases Count (Auto-calculated) */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} color="text.primary">
                      <CheckIcon fontSize="small" color="success" />
                      Test Cases
                    </Typography>
                    <Box
                      sx={{
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: alpha('#4caf50', 0.3),
                        backgroundColor: alpha('#4caf50', 0.08),
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} color="success.dark">
                        {testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length} test case(s)
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Set */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                      Question Set
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={formData.set}
                        onChange={handleChange('set')}
                        sx={{
                          borderRadius: 2.5,
                          backgroundColor: '#fff',
                          '&:hover': {
                            backgroundColor: alpha('#000', 0.02),
                          },
                        }}
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
              elevation={2}
              sx={{
                mt: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha('#395395', 0.2),
                overflow: 'hidden',
                transition: 'all 0.3s',
                background: 'linear-gradient(135deg, #f6f8fa 0%, #e6ecf0 100%)',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha('#395395', 0.15)}`,
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Test Cases Header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    mb: 3,
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha('#395395', 0.05),
                    },
                  }}
                  onClick={() => setTestCasesExpanded(!testCasesExpanded)}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: alpha('#395395', 0.1),
                      }}
                    >
                      <ScienceIcon sx={{ color: '#395395' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Test Cases
                    </Typography>
                    <Chip
                      size="small"
                      label={testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length}
                      sx={{
                        fontWeight: 700,
                        backgroundColor: alpha('#395395', 0.15),
                        color: '#395395',
                      }}
                    />
                  </Stack>
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: alpha('#395395', 0.1),
                      '&:hover': {
                        backgroundColor: alpha('#395395', 0.2),
                      },
                    }}
                  >
                    {testCasesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Stack>

                <Collapse in={testCasesExpanded}>
                  <Stack spacing={3}>
                    {testCases.map((testCase, index) => (
                      <Paper
                        key={index}
                        elevation={1}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: alpha('#395395', 0.15),
                          backgroundColor: '#fff',
                          position: 'relative',
                          transition: 'all 0.3s',
                          '&:hover': {
                            borderColor: alpha('#395395', 0.3),
                            boxShadow: `0 4px 16px ${alpha('#395395', 0.1)}`,
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                          <Chip
                            label={`Test Case #${index + 1}`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              backgroundColor: alpha('#395395', 0.15),
                              color: '#395395',
                            }}
                          />
                          <Tooltip title={testCases.length > 1 ? "Remove test case" : "At least one test case required"}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => removeTestCase(index)}
                                disabled={testCases.length <= 1}
                                sx={{
                                  color: 'error.main',
                                  backgroundColor: alpha('#f44336', 0.1),
                                  '&:hover': {
                                    backgroundColor: alpha('#f44336', 0.2),
                                  },
                                  '&:disabled': {
                                    backgroundColor: alpha('#000', 0.05),
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>

                        <Grid container spacing={2.5}>
                          {/* Input */}
                          <Grid item xs={12} md={5}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
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
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem',
                                  backgroundColor: alpha('#009fac', 0.02),
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    boxShadow: `0 0 0 2px ${alpha('#009fac', 0.1)}`,
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: '#fff',
                                    boxShadow: `0 0 0 3px ${alpha('#009fac', 0.15)}`,
                                  },
                                },
                              }}
                            />
                          </Grid>

                          {/* Expected Output */}
                          <Grid item xs={12} md={5}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
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
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem',
                                  backgroundColor: alpha('#009fac', 0.02),
                                  transition: 'all 0.3s',
                                  '&:hover': {
                                    boxShadow: `0 0 0 2px ${alpha('#009fac', 0.1)}`,
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: '#fff',
                                    boxShadow: `0 0 0 3px ${alpha('#009fac', 0.15)}`,
                                  },
                                },
                              }}
                            />
                          </Grid>

                          {/* Output Type */}
                          <Grid item xs={12} md={2}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 1, display: 'block' }}>
                              Match Type
                            </Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                value={testCase.output_type}
                                onChange={handleTestCaseChange(index, 'output_type')}
                                sx={{
                                  borderRadius: 2,
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
                      startIcon={<PlaylistAddIcon />}
                      onClick={addTestCase}
                      sx={{
                        py: 2,
                        borderRadius: 3,
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        borderColor: alpha('#395395', 0.3),
                        fontWeight: 600,
                        textTransform: 'none',
                        color: '#395395',
                        backgroundColor: '#fff',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderWidth: 2,
                          borderStyle: 'dashed',
                          borderColor: '#395395',
                          backgroundColor: alpha('#395395', 0.08),
                          transform: 'translateY(-2px)',
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
              elevation={2}
              sx={{
                mb: 3,
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha('#009fac', 0.2),
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #f0f8f9 0%, #d9eef1 100%)',
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  background: `linear-gradient(135deg, ${alpha('#009fac', 0.1)} 0%, ${alpha('#395395', 0.1)} 100%)`,
                  borderBottom: '1px solid',
                  borderColor: alpha('#009fac', 0.2),
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ color: '#009fac' }}>
                  Question Preview
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                      Title
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ color: formData.title ? 'text.primary' : 'text.disabled' }}>
                      {formData.title || 'No title yet'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {formData.difficulty && (
                      <Chip
                        size="small"
                        label={formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                        sx={{
                          backgroundColor: alpha(getDifficultyColor(formData.difficulty), 0.2),
                          color: getDifficultyColor(formData.difficulty),
                          fontWeight: 700,
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: getDifficultyColor(formData.difficulty),
                        }}
                      />
                    )}
                    {formData.points && (
                      <Chip
                        size="small"
                        icon={<TrophyIcon sx={{ fontSize: 16 }} />}
                        label={`${formData.points} pts`}
                        sx={{
                          backgroundColor: alpha('#ff9800', 0.2),
                          color: '#ff9800',
                          fontWeight: 700,
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: '#ff9800',
                        }}
                      />
                    )}
                    {testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length > 0 && (
                      <Chip
                        size="small"
                        icon={<ScienceIcon sx={{ fontSize: 16 }} />}
                        label={`${testCases.filter(tc => tc.input.trim() && tc.expected_output.trim()).length} test cases`}
                        sx={{
                          backgroundColor: alpha('#4caf50', 0.2),
                          color: '#4caf50',
                          fontWeight: 700,
                          borderWidth: 2,
                          borderStyle: 'solid',
                          borderColor: '#4caf50',
                        }}
                      />
                    )}
                  </Stack>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                      Set
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {SET_OPTIONS.find(s => s.value === formData.set)?.label || 'Set A'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card
              elevation={2}
              sx={{
                borderRadius: 4,
                border: '2px solid',
                borderColor: alpha('#009fac', 0.3),
                background: 'linear-gradient(135deg, #f0f8f9 0%, #d9eef1 100%)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  background: `linear-gradient(135deg, ${alpha('#009fac', 0.15)} 0%, ${alpha('#395395', 0.15)} 100%)`,
                  borderBottom: '1px solid',
                  borderColor: alpha('#009fac', 0.2),
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ color: '#009fac' }}>
                  Actions
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
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
                      py: 1.75,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #009fac 0%, #395395 100%)',
                      boxShadow: `0 6px 20px ${alpha('#009fac', 0.4)}`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: `0 8px 28px ${alpha('#009fac', 0.5)}`,
                        transform: 'translateY(-2px)',
                        background: 'linear-gradient(135deg, #395395 0%, #009fac 100%)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
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
                      py: 1.75,
                      borderRadius: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      borderWidth: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: alpha('#000', 0.05),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Clear Form
                  </Button>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    backgroundColor: alpha('#009fac', 0.08),
                    border: '1px solid',
                    borderColor: alpha('#009fac', 0.2),
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.7, fontWeight: 500 }}>
                    💡 <strong style={{ color: '#009fac' }}>Tip:</strong> Test cases will be created along with the question. Make sure each test case has both input and expected output filled in.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom padding for scroll */}
        <Box sx={{ height: 60 }} />
      </Box>
    </Box>
  );
};

export default CreateQuestionPage;