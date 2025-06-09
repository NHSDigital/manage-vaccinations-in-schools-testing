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

    var data = {"OkPercent": 92.98998569384835, "KoPercent": 7.010014306151645};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6461665747380033, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.6683673469387755, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.520618556701031, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.08673469387755102, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.4, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.96, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8309859154929577, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.008064516129032258, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4690721649484536, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.9030612244897959, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.8826530612244898, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.7560975609756098, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.94, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.96, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.875, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient return to activity vaccination page"], "isController": false}, {"data": [0.93, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9587628865979382, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.0, 500, 1500, "5.1 Consent homepage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1398, 98, 7.010014306151645, 383.4313304721028, 99, 1331, 321.0, 674.1000000000001, 805.05, 993.03, 1.3621283499052455, 30.460861075148465, 1.5219877875523098], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 97, 0, 0.0, 774.7628865979382, 637, 1049, 724.0, 986.4, 1000.3, 1049.0, 0.12208967171723528, 2.9788279537047293, 0.28394993599732155], "isController": false}, {"data": ["4.1 Vaccination questions", 98, 1, 1.0204081632653061, 475.173469387755, 300, 587, 528.0, 559.0, 567.1, 587.0, 0.1182523747007491, 1.3672541960739004, 0.239205586881709], "isController": false}, {"data": ["3.1 Nurse triage new", 97, 0, 0.0, 271.27835051546407, 199, 469, 220.0, 413.4, 432.2, 469.0, 0.12099002268874756, 1.3630891286410824, 0.08318064059851393], "isController": false}, {"data": ["3.2 Nurse triage result", 97, 0, 0.0, 673.4536082474226, 438, 1066, 598.0, 884.8000000000001, 919.3999999999999, 1066.0, 0.12190876448609171, 7.275705252413982, 0.1987865954086897], "isController": false}, {"data": ["2.0 Register attendance", 98, 0, 0.0, 1762.1734693877547, 1335, 2786, 1711.5, 2057.4, 2083.2, 2786.0, 0.12310660780998368, 16.528651963801632, 0.5346535483281369], "isController": true}, {"data": ["1.0 Login", 25, 0, 0.0, 1476.36, 1338, 2159, 1409.0, 1797.0000000000007, 2110.7, 2159.0, 2.3564897728343857, 110.74121176595344, 11.218640275944953], "isController": true}, {"data": ["5.0 Consent", 71, 71, 100.0, 185.2253521126761, 101, 326, 111.0, 310.6, 318.59999999999997, 326.0, 0.10655796753433867, 0.4777418251466298, 0.08033471771143502], "isController": true}, {"data": ["1.4 Select Organisations", 25, 0, 0.0, 317.76, 298, 414, 314.0, 324.20000000000005, 388.49999999999994, 414.0, 1.3090375955597444, 18.807188579956016, 1.8919683998324432], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 262.27, 207, 536, 231.0, 334.6, 522.8499999999999, 535.99, 0.1258662746351766, 2.8509202870002794, 0.10857072433838393], "isController": false}, {"data": ["5.9 Patient return to menacwy vaccination page", 71, 0, 0.0, 355.450704225352, 226, 589, 267.0, 552.6, 569.0, 589.0, 0.10653446389907134, 2.108209837913815, 0.07428281955462591], "isController": false}, {"data": ["4.0 Vaccination", 124, 27, 21.774193548387096, 1287.330645161291, 102, 1772, 1592.5, 1680.0, 1714.0, 1768.75, 0.13508846660427903, 5.970063154879472, 0.6552443858622293], "isController": true}, {"data": ["1.2 Sign-in page", 25, 0, 0.0, 105.72, 99, 125, 105.0, 109.4, 120.49999999999999, 125.0, 2.6957084321759757, 16.24532884273237, 1.6242696314966574], "isController": false}, {"data": ["3.0 Nurse triage", 97, 0, 0.0, 1234.5154639175257, 999, 1663, 1259.0, 1398.2, 1535.6999999999998, 1663.0, 0.12145191380670364, 11.453300144693678, 0.36361476345048643], "isController": true}, {"data": ["2.5 Patient return to consent page", 98, 0, 0.0, 319.9693877551021, 230, 596, 266.0, 555.3000000000001, 569.55, 596.0, 0.12285181689062051, 2.796421337542889, 0.0851804589768951], "isController": false}, {"data": ["2.4 Patient attending session", 98, 0, 0.0, 479.8265306122448, 387, 745, 428.0, 711.2, 735.0, 745.0, 0.12308743478249946, 2.8535906853740727, 0.18294831615133222], "isController": false}, {"data": ["1.5 Open Sessions list", 25, 0, 0.0, 215.48, 201, 313, 209.0, 225.0, 287.49999999999994, 313.0, 1.1674605398337536, 13.700559870295134, 0.6977400882600168], "isController": false}, {"data": ["4.2 Vaccination batch", 123, 26, 21.13821138211382, 308.15447154471553, 102, 545, 340.0, 364.6, 533.0, 544.76, 0.14612050070624907, 2.3524887836923583, 0.21101228652151238], "isController": false}, {"data": ["1.1 Homepage", 25, 0, 0.0, 356.0, 296, 867, 314.0, 584.2, 785.3999999999999, 867.0, 2.6354627872654435, 13.601973467478388, 1.4284002411448449], "isController": false}, {"data": ["1.3 Sign-in", 25, 0, 0.0, 481.3999999999999, 432, 1079, 446.0, 531.0000000000002, 937.0999999999997, 1079.0, 1.3461849119595066, 13.063515107560173, 2.117874895670669], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 373.83, 212, 1331, 235.5, 873.7, 907.9, 1329.3799999999992, 0.12562088120535747, 6.061077480918188, 0.08228535748876321], "isController": false}, {"data": ["5.9 Patient return to activity vaccination page", 26, 0, 0.0, 279.65384615384625, 223, 440, 249.0, 434.5, 439.3, 440.0, 0.033039115771603136, 0.5952215610251529, 0.02306930446942992], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 321.79, 219, 619, 268.5, 529.9000000000001, 562.75, 618.6799999999998, 0.12569935981316047, 2.107191415535058, 0.08123198374644428], "isController": false}, {"data": ["3.3 Nurse triage complete", 97, 0, 0.0, 289.783505154639, 233, 610, 265.0, 377.40000000000003, 550.0999999999999, 610.0, 0.12150531303902325, 2.8378147649154037, 0.08211101232715243], "isController": false}, {"data": ["5.1 Consent homepage", 71, 71, 100.0, 184.23943661971825, 100, 325, 110.0, 308.8, 317.4, 325.0, 0.10615124010064932, 0.4759183040059385, 0.08002808335713016], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 98, 100.0, 7.010014306151645], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1398, 98, "422/Unprocessable Entity", 98, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 98, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 123, 26, "422/Unprocessable Entity", 26, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.1 Consent homepage", 71, 71, "422/Unprocessable Entity", 71, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
