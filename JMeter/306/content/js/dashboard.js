/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.97668019215521, "KoPercent": 0.02331980784478336};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8806366547372386, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9814814814814815, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.5560165975103735, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9931710213776722, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5925925925925926, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9949793266391022, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.49877750611246946, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.35185185185185186, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.989010989010989, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9415073115860517, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9930715935334873, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9884326200115674, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5024449877750611, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9799410029498525, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.48148148148148145, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.8635250917992656, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9957907396271798, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.49190283400809715, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5024509803921569, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6428571428571429, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8968768414849735, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9945815773630343, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9905548996458088, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21441, 5, 0.02331980784478336, 198.67114406977353, 0, 16406, 105.0, 429.0, 507.0, 767.9600000000064, 5.766337081008686, 2413.117802132373, 43.81012457919334], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 131.59259259259264, 78, 703, 93.0, 214.79999999999984, 574.5999999999993, 703.0, 0.007914029023382438, 3.5899745089491546, 0.058837977714240826], "isController": false}, {"data": ["2.0 Register attendance", 1687, 4, 0.23710729104919975, 805.4048606994651, 348, 3474, 773.0, 1142.0000000000002, 1318.6, 2224.5999999999967, 0.4731734229679558, 974.3449068815844, 15.967984226699434], "isController": true}, {"data": ["2.5 Select patient", 1684, 0, 0.0, 111.17161520190032, 56, 1527, 92.0, 151.5, 251.0, 521.650000000001, 0.4743596496837086, 213.04921160947356, 3.421377181167077], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 768.4814814814815, 366, 3796, 599.0, 1239.6, 2812.7999999999947, 3796.0, 0.0079076341471558, 3.6663044424136793, 0.05836742371768926], "isController": false}, {"data": ["2.3 Search by first/last name", 1693, 0, 0.0, 108.9509746012994, 63, 1288, 90.0, 138.60000000000014, 213.5999999999999, 502.3599999999997, 0.473854855430886, 214.71048980179964, 3.543928831751858], "isController": false}, {"data": ["4.0 Vaccination for flu", 409, 0, 0.0, 714.1149144254274, 180, 2546, 656.0, 923.0, 1079.5, 2090.4999999999973, 0.1170460216944372, 154.034100510624, 3.321801845342141], "isController": true}, {"data": ["4.0 Vaccination for hpv", 435, 0, 0.0, 707.9126436781604, 176, 2400, 656.0, 937.4000000000001, 1051.5999999999997, 1766.9599999999998, 0.12483115510141884, 163.89709283440115, 3.540942879128719], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2488.407407407408, 308, 16406, 1284.0, 6477.0, 12483.999999999978, 16406.0, 0.007915878254965161, 4.384435985703484, 0.0583718717805097], "isController": false}, {"data": ["1.2 Sign-in page", 1729, 0, 0.0, 126.49855407750111, 15, 4963, 90.0, 172.0, 286.0, 684.1000000000006, 0.48133725455697485, 214.9878755588516, 4.085703699789481], "isController": false}, {"data": ["2.4 Patient attending session", 889, 4, 0.4499437570303712, 383.39482564679435, 166, 1558, 336.0, 508.0, 648.5, 1128.5, 0.2501470915546796, 113.78400021550213, 2.1942841341217516], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.775862068965516, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1732, 0, 0.0, 124.18764434180133, 25, 4967, 95.0, 161.0, 237.3499999999999, 570.3600000000006, 0.48110028635466817, 214.65729287801094, 4.075218637441768], "isController": false}, {"data": ["1.3 Sign-in", 1729, 0, 0.0, 141.07229612492785, 59, 4885, 96.0, 229.0, 333.0, 701.4000000000001, 0.48143000024503085, 215.23737055912846, 4.249178489580897], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 9193.814814814818, 3904, 36526, 5875.0, 14835.999999999998, 28293.199999999953, 36526.0, 0.007927271104450899, 32.047817274070574, 0.4698599785185633], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 409, 0, 0.0, 732.4963325183371, 199, 2276, 679.0, 941.0, 1110.0, 1835.199999999992, 0.1184069202910089, 156.2328373068288, 3.3609818008165444], "isController": true}, {"data": ["2.1 Open session", 1695, 0, 0.0, 254.55811209439548, 110, 2173, 221.0, 389.0, 466.39999999999964, 794.4399999999987, 0.47335989175557874, 211.56977450475244, 3.4168409039498324], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1896.6296296296298, 229, 13633, 736.0, 5193.5999999999985, 10717.399999999983, 13633.0, 0.007918218295307313, 4.377384561358567, 0.0583813946577834], "isController": false}, {"data": ["4.3 Vaccination confirm", 1634, 0, 0.0, 473.5538555691552, 305, 2303, 433.5, 630.0, 758.0, 1202.6000000000004, 0.4712831650385189, 210.40469485929285, 4.858146419462927], "isController": false}, {"data": ["4.1 Vaccination questions", 1663, 0, 0.0, 130.51593505712594, 77, 1693, 108.0, 175.0, 244.5999999999999, 442.0, 0.47347109833337037, 207.13527110918076, 4.439987936434013], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1817.8888888888887, 353, 6984, 992.0, 4497.599999999999, 6063.9999999999945, 6984.0, 0.007918072002254598, 4.399038290586498, 0.05840551822901469], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1729, 1, 0.0578368999421631, 825.0965876229035, 234, 14815, 746.0, 1013.0, 1138.0, 1927.2000000000053, 0.4812622263986666, 883.9221958886003, 15.815306546067427], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 408, 0, 0.0, 709.4485294117645, 186, 2354, 658.0, 943.7000000000002, 1099.9499999999996, 1623.9099999999935, 0.11746246527227973, 154.90239238905124, 3.337292589590321], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1173.25, 214, 4938, 584.0, 4698.7, 4861.499999999999, 4938.0, 0.007919134325487734, 4.337862983155578, 0.05712233551180234], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.358506944444445, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 1903.5555555555557, 1650, 3964, 1740.0, 2249.5999999999995, 3536.7999999999975, 3964.0, 0.007910071278531187, 4.396720767342831, 0.05900167027014359], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 94.66666666666667, 77, 136, 91.0, 114.99999999999999, 135.6, 136.0, 0.007911800421024994, 3.5894119822642345, 0.05896048346887908], "isController": false}, {"data": ["Debug Sampler", 1693, 0, 0.0, 0.334908446544596, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.47390870833144383, 2.7363138456746943, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1697, 1, 0.05892751915144372, 441.43901001767813, 306, 1771, 416.0, 573.0, 628.4999999999995, 843.02, 0.47310494566123457, 239.45505218346506, 3.4115419010643326], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.05208333333333, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1661, 0, 0.0, 119.52257676098725, 69, 1763, 98.0, 153.0, 229.79999999999973, 496.9799999999975, 0.4732889507403368, 208.27156627361387, 4.196671745404737], "isController": false}, {"data": ["2.2 Session register", 1694, 0, 0.0, 128.54958677685937, 61, 1459, 90.0, 243.5, 334.0, 615.2499999999998, 0.4736460963341358, 220.3577073586576, 3.4230643905476286], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 92.59259259259258, 77, 130, 93.0, 111.4, 123.19999999999996, 130.0, 0.00791554871756384, 3.5911125029793247, 0.0587410557047946], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, 80.0, 0.018655846275826688], "isController": false}, {"data": ["Assertion failed", 1, 20.0, 0.004663961568956672], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21441, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 889, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1697, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
