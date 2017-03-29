-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2017 at 01:21 PM
-- Server version: 5.7.14
-- PHP Version: 5.6.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `plutus_cba`
--

-- --------------------------------------------------------

--
-- Table structure for table `v1_promotions`
--

CREATE TABLE `v1_promotions` (
  `id` int(11) NOT NULL,
  `promotion_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `type` varchar(250) NOT NULL,
  `image` varchar(250) NOT NULL,
  `triggers` varchar(250) NOT NULL,
  `apply` varchar(250) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  `is_firebase` int(11) NOT NULL COMMENT '0 for no 1 for yes',
  `is_approved` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `v1_promotions`
--

INSERT INTO `v1_promotions` (`id`, `promotion_id`, `site_id`, `company_id`, `name`, `type`, `image`, `triggers`, `apply`, `created_at`, `updated_at`, `is_firebase`, `is_approved`) VALUES
(19, 6, 22514, 20155, 'Frst upsel promo', 'discount', '', '', '{"order_total":true,"percent":10}', '2017-03-29 05:53:37', '2017-03-29 05:53:37', 0, 0),
(20, 6, 22514, 20155, 'first upsell promo', 'discount', '', '', '{"order_total":true,"percent":10}', '2017-03-29 05:53:42', '2017-03-29 05:53:42', 1, 0),
(21, 6, 22515, 20155, 'Frst upsel promo', 'upsell', '', '[{"product_ids":[1863694],"quantity":20}]', '{"product_ids":[1863694],"percent":10}', '2017-03-29 07:23:51', '2017-03-29 07:23:51', 0, 0),
(22, 6, 22515, 20155, 'first upsell promo', 'upsell', '', '[{"product_ids":[1863694],"quantity":20}]', '{"product_ids":[1863694],"percent":10}', '2017-03-29 07:23:55', '2017-03-29 07:23:55', 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `v1_promotions`
--
ALTER TABLE `v1_promotions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `v1_promotions`
--
ALTER TABLE `v1_promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
