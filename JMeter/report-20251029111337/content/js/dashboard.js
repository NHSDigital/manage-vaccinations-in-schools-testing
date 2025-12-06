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

    var data = {"OkPercent": 99.63898916967509, "KoPercent": 0.36101083032490977};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3155588701407663, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.386002886002886, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5259467040673211, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.693213296398892, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.45625841184387617, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.171071953010279, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.43178519593613934, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.43951612903225806, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.40527740189445194, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6577134986225895, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5303030303030303, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8587, 31, 0.36101083032490977, 2391.423314312338, 240, 30193, 1019.0, 6035.999999999994, 12254.599999999999, 16429.76000000004, 4.742312450296015, 1936.4989161122717, 19.68925808431867], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 678, 0, 0.0, 3061.0958702064886, 1573, 19789, 2561.5, 4598.4, 6206.699999999995, 10576.90000000001, 0.41776499425111, 168.52229078361438, 2.166910401424098], "isController": false}, {"data": ["4.1 Vaccination questions", 693, 0, 0.0, 1518.2828282828273, 648, 16292, 1228.0, 2106.0, 3328.799999999998, 7647.659999999991, 0.41382324910368157, 163.37786858950915, 2.0558582870718154], "isController": false}, {"data": ["2.0 Register attendance", 716, 29, 4.050279329608938, 5586.502793296095, 1765, 28371, 4657.0, 8777.800000000007, 11283.75, 21441.080000000045, 0.40839491103436276, 824.0452825370179, 7.560952878086134], "isController": true}, {"data": ["1.0 Login", 737, 2, 0.27137042062415195, 16991.263229307977, 4398, 46483, 15328.0, 22058.2, 29467.4, 36489.32, 0.4096410721590808, 680.0181328791292, 6.773302726107143], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 166, 0, 0.0, 5796.096385542168, 1585, 23734, 4876.0, 7980.9000000000015, 12161.300000000007, 19204.800000000083, 0.10199178904657338, 121.79798919117438, 1.4899306916640758], "isController": true}, {"data": ["2.5 Select patient", 713, 0, 0.0, 1132.1669004207572, 395, 11967, 981.0, 1623.6, 2150.0, 6325.8000000000275, 0.41369738703392317, 168.30168904614322, 1.4704448066472409], "isController": false}, {"data": ["2.3 Search by first/last name", 722, 0, 0.0, 752.7216066481991, 396, 11087, 526.0, 1096.5000000000002, 1655.6000000000004, 5172.219999999998, 0.41100491270415046, 167.6442101746486, 1.528251628969869], "isController": false}, {"data": ["4.0 Vaccination for flu", 177, 0, 0.0, 5788.316384180791, 1894, 21388, 4755.0, 8591.800000000007, 12417.899999999996, 20022.999999999996, 0.10698820349277195, 126.89424394587304, 1.5503715063364822], "isController": true}, {"data": ["4.0 Vaccination for hpv", 178, 0, 0.0, 5832.095505617979, 2237, 24328, 4829.0, 9094.6, 11186.499999999985, 19100.570000000054, 0.10801816404318057, 128.39291600533355, 1.5742483502197684], "isController": true}, {"data": ["1.2 Sign-in page", 743, 0, 0.0, 1072.2018842530297, 240, 11639, 780.0, 1659.0000000000002, 2563.7999999999965, 6346.759999999995, 0.4138270592769667, 166.07182598596526, 1.7513503683784886], "isController": false}, {"data": ["2.4 Patient attending session", 681, 29, 4.258443465491924, 2165.1688693098386, 536, 13908, 1662.0, 3724.4, 4989.999999999998, 7904.779999999986, 0.3907556732731726, 159.5277171595247, 1.699536478813698], "isController": false}, {"data": ["1.4 Open Sessions list", 733, 1, 0.1364256480218281, 13524.306957708059, 10043, 30193, 12405.0, 16869.600000000002, 21005.199999999983, 27999.559999999998, 0.4083542710068468, 187.23422577990513, 1.4483597932602046], "isController": false}, {"data": ["4.2 Vaccination batch", 689, 0, 0.0, 1220.4513788098698, 632, 13031, 982.0, 1686.0, 2302.0, 6485.100000000009, 0.4134351419870689, 164.31957146044914, 1.8498054756529303], "isController": false}, {"data": ["1.1 Homepage", 744, 1, 0.13440860215053763, 1168.8991935483857, 630, 12889, 985.5, 1606.5, 2183.75, 5315.34999999999, 0.41342635426304253, 165.62907806600234, 1.736420425498515], "isController": false}, {"data": ["1.3 Sign-in", 739, 0, 0.0, 1300.6035182679313, 506, 18015, 848.0, 2077.0, 3412.0, 10067.600000000033, 0.4125375693889308, 165.88260908782163, 1.887938224348146], "isController": false}, {"data": ["2.2 Session register", 726, 0, 0.0, 790.1887052341597, 390, 12613, 540.0, 1311.500000000001, 1826.6499999999996, 4707.870000000006, 0.4118296069182836, 172.26847458717768, 1.4703160763870178], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 166, 0, 0.0, 5587.246987951809, 2199, 23941, 4689.5, 8240.100000000006, 10484.0, 19759.53000000008, 0.10225799198568389, 121.98881423272626, 1.4903832826663463], "isController": true}, {"data": ["2.1 Open session", 726, 0, 0.0, 863.6928374655647, 439, 11914, 728.5, 1259.3000000000002, 1703.4999999999998, 3568.8900000000017, 0.4115219339490291, 164.2534380202479, 1.465600728850125], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 3.225806451612903, 0.01164551065564225], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 29, 93.54838709677419, 0.33771980901362525], "isController": false}, {"data": ["Assertion failed", 1, 3.225806451612903, 0.01164551065564225], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8587, 31, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 29, "502/Bad Gateway", 1, "Assertion failed", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 681, 29, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 29, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 733, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 744, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
